import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasAdminSessionConfig, serverEnv } from "@/lib/server-env";

const COOKIE_NAME = "bandinity_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

interface SessionPayload {
  expiresAt: number;
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", serverEnv.adminSessionSecret)
    .update(value)
    .digest("hex");
}

function encode(payload: SessionPayload): string {
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${serialized}.${sign(serialized)}`;
}

function decode(token: string): SessionPayload | null {
  const [serialized, signature] = token.split(".");
  if (!serialized || !signature) return null;
  if (sign(serialized) !== signature) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(serialized, "base64url").toString("utf8")
    ) as SessionPayload;

    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  if (!hasAdminSessionConfig()) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return Boolean(token && decode(token));
}

export async function requireAdminSession(): Promise<void> {
  const valid = await isAdminLoggedIn();
  if (!valid) {
    redirect("/admin/login");
  }
}

/** 타이밍 공격 완화: 해시 후 상수 시간 비교 */
function constantTimeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
  const hashB = crypto.createHash("sha256").update(b, "utf8").digest();
  if (hashA.length !== hashB.length) return false;
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function createAdminSession(password: string): Promise<boolean> {
  if (!hasAdminSessionConfig()) {
    return false;
  }
  const input = password.trim();
  const expected = serverEnv.adminPassword.trim();
  if (!constantTimeEqual(input, expected)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encode({ expiresAt: Date.now() + SESSION_DURATION_MS }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return true;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
