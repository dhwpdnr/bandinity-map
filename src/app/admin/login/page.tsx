import { redirect } from "next/navigation";
import { loginAdminAction } from "@/app/actions";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getMissingAdminEnvKeys, hasAdminSessionConfig } from "@/lib/server-env";
import { BUTTON_PRIMARY, INPUT_BASE, LABEL_BASE, RADIUS_PANEL } from "@/lib/ui";

export const dynamic = "force-dynamic";

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await isAdminLoggedIn()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface-app)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <section
        className={`w-full max-w-sm border border-white/10 bg-[rgba(11,14,20,0.92)] p-6 shadow-[0_14px_36px_-28px_rgba(0,0,0,0.74)] ${RADIUS_PANEL}`}
      >
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-zinc-100">관리자 로그인</h1>
          <p className="mt-1 text-sm text-zinc-400">비밀번호를 입력하세요.</p>
        </div>

        {!hasAdminSessionConfig() && (
          <div className="mb-5 rounded-[14px] bg-amber-500/12 px-4 py-3 text-sm text-amber-300">
            관리자 세션 환경 변수가 없습니다.
            <pre className="mt-2 text-xs text-zinc-400">{getMissingAdminEnvKeys().join("\n")}</pre>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-[14px] bg-rose-500/12 px-4 py-3 text-sm text-rose-300">
            비밀번호가 올바르지 않습니다.
          </div>
        )}

        <form action={loginAdminAction} className="space-y-4">
          <label className="space-y-2">
            <span className={LABEL_BASE}>관리자 비밀번호</span>
            <input name="password" type="password" required className={INPUT_BASE} />
          </label>
          <button type="submit" className={`${BUTTON_PRIMARY} w-full`}>
            로그인
          </button>
        </form>
      </section>
    </div>
  );
}
