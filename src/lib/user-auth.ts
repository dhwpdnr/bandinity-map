import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { getUserSessionSecret, hasUserSessionConfig } from "@/lib/user-session-env";

export const USER_SESSION_COOKIE_NAME = "bandinity_user_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

export interface UserSessionProfile {
  kakaoId: string;
  nickname: string;
  profileImage?: string;
}

interface UserSessionPayload extends UserSessionProfile {
  expiresAt: number;
}

function sign(value: string): string {
  const secret = getUserSessionSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

function encode(payload: UserSessionPayload): string {
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${serialized}.${sign(serialized)}`;
}

export function encodeUserSessionToken(
  profile: UserSessionProfile,
  expiresAt: number = Date.now() + SESSION_DURATION_MS
): string {
  const normalized = normalizeUserSessionProfile(profile);
  return encode({
    ...normalized,
    expiresAt,
  });
}

export function decodeUserSessionToken(token: string): UserSessionPayload | null {
  const [serialized, signature] = token.split(".");
  if (!serialized || !signature) return null;
  if (sign(serialized) !== signature) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(serialized, "base64url").toString("utf8")
    ) as UserSessionPayload;

    if (!payload.kakaoId || !payload.nickname) return null;
    if (!payload.expiresAt || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function trimText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function normalizeUserSessionProfile(
  profile: UserSessionProfile
): UserSessionProfile {
  return {
    kakaoId: trimText(profile.kakaoId, 64),
    nickname: trimText(profile.nickname, 80),
    profileImage: profile.profileImage ? trimText(profile.profileImage, 500) : undefined,
  };
}

export function setUserSessionCookie(
  response: NextResponse,
  profile: UserSessionProfile
): boolean {
  if (!hasUserSessionConfig()) {
    console.error("[auth:user-session] failed to create session cookie: missing USER_SESSION_SECRET");
    return false;
  }

  const normalized = normalizeUserSessionProfile(profile);
  if (!normalized.kakaoId || !normalized.nickname) {
    console.error("[auth:user-session] failed to create session cookie: invalid profile", {
      hasKakaoId: Boolean(normalized.kakaoId),
      hasNickname: Boolean(normalized.nickname),
      hasProfileImage: Boolean(normalized.profileImage),
    });
    return false;
  }

  response.cookies.set(USER_SESSION_COOKIE_NAME, encodeUserSessionToken(normalized), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return true;
}

export async function createUserSession(profile: UserSessionProfile): Promise<boolean> {
  if (!hasUserSessionConfig()) {
    return false;
  }

  const normalized = normalizeUserSessionProfile(profile);
  if (!normalized.kakaoId || !normalized.nickname) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(
    USER_SESSION_COOKIE_NAME,
    encodeUserSessionToken(normalized),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    }
  );

  return true;
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE_NAME);
}

export async function getCurrentUserSession(): Promise<UserSessionProfile | null> {
  if (!hasUserSessionConfig()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = decodeUserSessionToken(token);
  if (!payload) return null;

  return {
    kakaoId: payload.kakaoId,
    nickname: payload.nickname,
    profileImage: payload.profileImage,
  };
}

export async function requireUserSession(): Promise<UserSessionProfile> {
  const session = await getCurrentUserSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
