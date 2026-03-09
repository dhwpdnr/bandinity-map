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

export async function createAdminSession(password: string): Promise<boolean> {
  if (
    !hasAdminSessionConfig() ||
    password.trim() !== serverEnv.adminPassword.trim()
  ) {
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
