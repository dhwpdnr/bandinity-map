import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getKakaoOAuthEnv, hasKakaoOAuthConfig } from "@/lib/kakao-oauth-env";

const STATE_COOKIE = "bandinity_kakao_oauth_state";
const PKCE_COOKIE = "bandinity_kakao_oauth_pkce_verifier";
const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;

function toBase64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildAuthorizeUrl(state: string, codeChallenge: string): URL {
  const kakaoEnv = getKakaoOAuthEnv();
  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", kakaoEnv.clientId);
  url.searchParams.set("redirect_uri", kakaoEnv.redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url;
}

export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);

  if (!hasKakaoOAuthConfig()) {
    loginUrl.searchParams.set("error", "missing_kakao_env");
    return NextResponse.redirect(loginUrl);
  }

  const state = crypto.randomBytes(32).toString("hex");
  const codeVerifier = toBase64Url(crypto.randomBytes(64));
  const codeChallenge = toBase64Url(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );

  const response = NextResponse.redirect(buildAuthorizeUrl(state, codeChallenge));
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  };

  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  response.cookies.set(PKCE_COOKIE, codeVerifier, cookieOptions);

  return response;
}
