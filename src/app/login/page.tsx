import {
  getMissingKakaoOAuthEnvKeys,
  hasKakaoOAuthConfig,
} from "@/lib/kakao-oauth-env";
import KakaoLoginButton from "@/components/auth/KakaoLoginButton";
import { RADIUS_PANEL } from "@/lib/ui";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pickParam(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const ERROR_MESSAGE_MAP: Record<string, string> = {
  missing_kakao_env: "카카오 로그인 환경 변수가 누락되었습니다.",
  missing_code: "인가 코드가 없어 로그인을 완료할 수 없습니다.",
  state_mismatch: "요청 검증에 실패했습니다. 다시 시도해 주세요.",
  missing_pkce: "보안 검증 정보가 누락되어 로그인을 완료할 수 없습니다.",
  token_exchange_failed: "카카오 토큰 교환에 실패했습니다.",
  user_info_failed: "카카오 사용자 확인에 실패했습니다.",
  session_failed: "로그인 세션 생성에 실패했습니다. 다시 시도해 주세요.",
  timeout: "카카오 인증 요청이 시간 초과되었습니다.",
  oauth_failed: "카카오 로그인 처리 중 오류가 발생했습니다.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const success = pickParam(params.success);
  const error = pickParam(params.error);
  const errorMessage = error ? ERROR_MESSAGE_MAP[error] ?? "로그인에 실패했습니다." : null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface-app)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <section
        className={`w-full max-w-sm border border-white/10 bg-[rgba(11,14,20,0.92)] p-6 shadow-[0_14px_36px_-28px_rgba(0,0,0,0.74)] ${RADIUS_PANEL}`}
      >
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-zinc-100">사용자 로그인</h1>
          <p className="mt-1 text-sm text-zinc-400">
            카카오 계정으로 로그인 후 성공 여부를 확인합니다.
          </p>
        </div>

        {!hasKakaoOAuthConfig() && (
          <div className="mb-5 rounded-[14px] bg-amber-500/12 px-4 py-3 text-sm text-amber-300">
            카카오 OAuth 환경 변수가 없습니다.
            <pre className="mt-2 text-xs text-zinc-400">
              {getMissingKakaoOAuthEnvKeys().join("\n")}
            </pre>
          </div>
        )}

        {success === "kakao" && (
          <div className="mb-5 rounded-[14px] bg-emerald-500/12 px-4 py-3 text-sm text-emerald-300">
            카카오 로그인 성공
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-[14px] bg-rose-500/12 px-4 py-3 text-sm text-rose-300">
            {errorMessage}
          </div>
        )}

        <KakaoLoginButton href="/api/auth/kakao" className="w-full" />
      </section>
    </div>
  );
}
