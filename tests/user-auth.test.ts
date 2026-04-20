import test from "node:test";
import assert from "node:assert/strict";

process.env.USER_SESSION_SECRET =
  process.env.USER_SESSION_SECRET || "test-user-session-secret";

async function getUserAuth() {
  return import("@/lib/user-auth");
}

test("encode/decode user session token roundtrip", async () => {
  const { encodeUserSessionToken, decodeUserSessionToken } = await getUserAuth();

  const token = encodeUserSessionToken({
    kakaoId: "12345",
    nickname: "Bandinity",
    profileImage: "https://example.com/profile.png",
  });

  const payload = decodeUserSessionToken(token);
  assert.ok(payload);
  assert.equal(payload.kakaoId, "12345");
  assert.equal(payload.nickname, "Bandinity");
  assert.equal(payload.profileImage, "https://example.com/profile.png");
});

test("decode rejects tampered token", async () => {
  const { encodeUserSessionToken, decodeUserSessionToken } = await getUserAuth();
  const token = encodeUserSessionToken({
    kakaoId: "12345",
    nickname: "Bandinity",
  });
  const tampered = `${token}x`;
  assert.equal(decodeUserSessionToken(tampered), null);
});

test("decode rejects expired token", async () => {
  const { encodeUserSessionToken, decodeUserSessionToken } = await getUserAuth();
  const token = encodeUserSessionToken(
    {
      kakaoId: "12345",
      nickname: "Bandinity",
    },
    Date.now() - 1000
  );
  assert.equal(decodeUserSessionToken(token), null);
});

test("normalize trims oversized session fields", async () => {
  const { normalizeUserSessionProfile } = await getUserAuth();
  const normalized = normalizeUserSessionProfile({
    kakaoId: "   12345   ",
    nickname: ` ${"a".repeat(120)} `,
    profileImage: ` ${"https://example.com/".padEnd(520, "x")} `,
  });

  assert.equal(normalized.kakaoId, "12345");
  assert.equal(normalized.nickname.length, 80);
  assert.equal(normalized.profileImage?.length, 500);
});
