import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("BUTTON_KAKAO token includes required brand style rules", async () => {
  const { BUTTON_KAKAO } = await import("@/lib/ui");

  assert.match(BUTTON_KAKAO, /rounded-\[12px\]/);
  assert.match(BUTTON_KAKAO, /#FEE500/i);
  assert.match(BUTTON_KAKAO, /text-black/);
  assert.match(BUTTON_KAKAO, /focus-visible:ring-2/);
});

test("KakaoLoginButton renders css-based button and auth entry link", async () => {
  const { default: KakaoLoginButton } = await import("@/components/auth/KakaoLoginButton");

  const html = renderToStaticMarkup(
    React.createElement(KakaoLoginButton, {
      href: "/api/auth/kakao",
      className: "w-full",
    })
  );

  assert.match(html, /href="\/api\/auth\/kakao"/);
  assert.match(html, /aria-label="카카오 로그인"/);
  assert.match(html, />카카오 로그인</);
  assert.match(html, /<svg/);
});

test("Login page includes Kakao auth entry button", async () => {
  const { default: LoginPage } = await import("@/app/login/page");
  const html = renderToStaticMarkup(
    await LoginPage({
      searchParams: Promise.resolve({}),
    })
  );

  assert.match(html, /href="\/api\/auth\/kakao"/);
  assert.match(html, />카카오 로그인</);
});
