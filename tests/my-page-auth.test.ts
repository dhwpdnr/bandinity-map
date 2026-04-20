import test from "node:test";
import assert from "node:assert/strict";

process.env.USER_SESSION_SECRET =
  process.env.USER_SESSION_SECRET || "test-user-session-secret";

function getCookieValue(cookieHeader: string, key: string): string | null {
  const prefix = `${key}=`;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

async function resolveMyPageSession(cookieHeader?: string) {
  const { USER_SESSION_COOKIE_NAME, decodeUserSessionToken } = await import(
    "@/lib/user-auth"
  );

  const token = cookieHeader
    ? getCookieValue(cookieHeader, USER_SESSION_COOKIE_NAME)
    : null;
  if (!token) return null;

  const payload = decodeUserSessionToken(token);
  if (!payload) return null;

  return {
    kakaoId: payload.kakaoId,
    nickname: payload.nickname,
    profileImage: payload.profileImage,
  };
}

test("/my guard redirects when user session cookie is missing", async () => {
  const session = await resolveMyPageSession();
  assert.equal(session, null);
});

test("/my guard accepts valid user session cookie", async () => {
  const { USER_SESSION_COOKIE_NAME, encodeUserSessionToken } = await import(
    "@/lib/user-auth"
  );
  const token = encodeUserSessionToken({
    kakaoId: "12345",
    nickname: "Bandinity User",
  });
  const session = await resolveMyPageSession(`${USER_SESSION_COOKIE_NAME}=${token}`);

  assert.ok(session);
  assert.equal(session.kakaoId, "12345");
  assert.equal(session.nickname, "Bandinity User");
});
