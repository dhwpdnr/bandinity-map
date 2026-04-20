import { NextRequest, NextResponse } from "next/server";
import { getKakaoOAuthEnv, hasKakaoOAuthConfig } from "@/lib/kakao-oauth-env";
import { setUserSessionCookie } from "@/lib/user-auth";

const STATE_COOKIE = "bandinity_kakao_oauth_state";
const PKCE_COOKIE = "bandinity_kakao_oauth_pkce_verifier";
const REQUEST_TIMEOUT_MS = 8000;

function clearOAuthCookies(response: NextResponse) {
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(PKCE_COOKIE);
}

function redirectToLogin(
  request: NextRequest,
  options: { success?: string; error?: string }
): NextResponse {
  const url = new URL("/login", request.url);
  if (options.success) {
    url.searchParams.set("success", options.success);
  }
  if (options.error) {
    url.searchParams.set("error", options.error);
  }

  const response = NextResponse.redirect(url);
  clearOAuthCookies(response);
  return response;
}

function redirectToMyPage(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/my", request.url));
  clearOAuthCookies(response);
  return response;
}

interface KakaoProfileResponse {
  id?: number;
  properties?: {
    nickname?: string;
    profile_image?: string;
  };
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const kakaoEnv = getKakaoOAuthEnv();

  if (!hasKakaoOAuthConfig()) {
    return redirectToLogin(request, { error: "missing_kakao_env" });
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(PKCE_COOKIE)?.value;

  if (!code) {
    return redirectToLogin(request, { error: "missing_code" });
  }

  if (!state || !storedState || state !== storedState) {
    return redirectToLogin(request, { error: "state_mismatch" });
  }

  if (!codeVerifier) {
    return redirectToLogin(request, { error: "missing_pkce" });
  }

  try {
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: kakaoEnv.clientId,
      redirect_uri: kakaoEnv.redirectUri,
      code,
      code_verifier: codeVerifier,
    });

    if (kakaoEnv.clientSecret) {
      tokenParams.set("client_secret", kakaoEnv.clientSecret);
    }

    const tokenResponse = await fetchWithTimeout(
      "https://kauth.kakao.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: tokenParams.toString(),
      },
      REQUEST_TIMEOUT_MS
    );

    if (!tokenResponse.ok) {
      return redirectToLogin(request, { error: "token_exchange_failed" });
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return redirectToLogin(request, { error: "token_exchange_failed" });
    }

    const profileResponse = await fetchWithTimeout(
      "https://kapi.kakao.com/v2/user/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
      REQUEST_TIMEOUT_MS
    );

    if (!profileResponse.ok) {
      return redirectToLogin(request, { error: "user_info_failed" });
    }

    const profileData = (await profileResponse.json()) as KakaoProfileResponse;
    const kakaoId = typeof profileData.id === "number" ? String(profileData.id) : "";
    const nickname =
      profileData.properties?.nickname ??
      profileData.kakao_account?.profile?.nickname ??
      "";
    const profileImage =
      profileData.properties?.profile_image ??
      profileData.kakao_account?.profile?.profile_image_url;

    const response = redirectToMyPage(request);
    const sessionCreated = setUserSessionCookie(response, {
      kakaoId,
      nickname,
      profileImage,
    });

    if (!sessionCreated) {
      console.error("[auth:kakao-callback] session_failed", {
        hasKakaoId: Boolean(kakaoId),
        hasNickname: Boolean(nickname),
        hasProfileImage: Boolean(profileImage),
        kakaoIdLength: kakaoId.length,
        nicknameLength: nickname.length,
      });
      return redirectToLogin(request, { error: "session_failed" });
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return redirectToLogin(request, { error: "timeout" });
    }
    return redirectToLogin(request, { error: "oauth_failed" });
  }
}
