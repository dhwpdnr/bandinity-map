import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

process.env.KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "test-client-id";
process.env.KAKAO_REDIRECT_URI =
  process.env.KAKAO_REDIRECT_URI ||
  "http://localhost:3000/api/auth/kakao/callback";
process.env.KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || "";
process.env.USER_SESSION_SECRET =
  process.env.USER_SESSION_SECRET || "test-user-session-secret";

async function getHandler() {
  const mod = await import("@/app/api/auth/kakao/callback/route");
  return mod.GET;
}

function makeRequest(url: string, cookieHeader: string): NextRequest {
  return new NextRequest(url, {
    headers: {
      cookie: cookieHeader,
    },
  });
}

test("kakao callback redirects with missing_code when code is absent", async () => {
  const GET = await getHandler();
  const request = makeRequest(
    "http://localhost:3000/api/auth/kakao/callback?state=test-state",
    "bandinity_kakao_oauth_state=test-state; bandinity_kakao_oauth_pkce_verifier=test-verifier"
  );

  const response = await GET(request);
  const location = response.headers.get("location");

  assert.ok(location);
  assert.match(location, /\/login\?error=missing_code/);
});

test("kakao callback redirects with state_mismatch when state differs", async () => {
  const GET = await getHandler();
  const request = makeRequest(
    "http://localhost:3000/api/auth/kakao/callback?code=test-code&state=from-query",
    "bandinity_kakao_oauth_state=from-cookie; bandinity_kakao_oauth_pkce_verifier=test-verifier"
  );

  const response = await GET(request);
  const location = response.headers.get("location");

  assert.ok(location);
  assert.match(location, /\/login\?error=state_mismatch/);
});

test("kakao callback redirects with success after token and user verification", async () => {
  const GET = await getHandler();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url === "https://kauth.kakao.com/oauth/token") {
      const body = init?.body?.toString() ?? "";
      assert.match(body, /grant_type=authorization_code/);
      assert.match(body, /code=test-code/);
      return new Response(JSON.stringify({ access_token: "access-token" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url === "https://kapi.kakao.com/v2/user/me") {
      return new Response(
        JSON.stringify({
          id: 12345,
          properties: {
            nickname: "Bandinity User",
            profile_image: "https://example.com/profile.png",
          },
        }),
        {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    throw new Error(`Unexpected fetch url: ${url}`);
  }) as typeof fetch;

  try {
    const request = makeRequest(
      "http://localhost:3000/api/auth/kakao/callback?code=test-code&state=test-state",
      "bandinity_kakao_oauth_state=test-state; bandinity_kakao_oauth_pkce_verifier=test-verifier"
    );
    const response = await GET(request);
    const location = response.headers.get("location");
    const setCookie = response.headers.get("set-cookie") ?? "";

    assert.ok(location);
    assert.match(location, /\/my$/);
    assert.match(setCookie, /bandinity_user_session=/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
