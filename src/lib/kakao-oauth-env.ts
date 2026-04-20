export interface KakaoOAuthEnv {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getKakaoOAuthEnv(): KakaoOAuthEnv {
  return {
    clientId: process.env.KAKAO_CLIENT_ID ?? "",
    clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    redirectUri: process.env.KAKAO_REDIRECT_URI ?? "",
  };
}

export function hasKakaoOAuthConfig(): boolean {
  const env = getKakaoOAuthEnv();
  return Boolean(env.clientId && env.redirectUri);
}

export function getMissingKakaoOAuthEnvKeys(): string[] {
  const env = getKakaoOAuthEnv();
  const keys: string[] = [];

  if (!env.clientId) keys.push("KAKAO_CLIENT_ID");
  if (!env.redirectUri) keys.push("KAKAO_REDIRECT_URI");

  return keys;
}
