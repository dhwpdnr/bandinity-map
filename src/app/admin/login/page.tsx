import { redirect } from "next/navigation";
import { loginAdminAction } from "@/app/actions";
import { SiteHeader } from "@/components/SiteHeader";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getMissingAdminEnvKeys, hasAdminSessionConfig } from "@/lib/server-env";

export const dynamic = "force-dynamic";

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await isAdminLoggedIn()) {
    redirect("/admin/submissions");
  }

  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80" containerClassName="max-w-6xl" />
      <div className="flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              관리자 로그인
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              제출된 제보 검토와 장소 상태 관리를 위한 간단한 관리자 게이트입니다.
            </p>
          </div>

          {!hasAdminSessionConfig() && (
            <div className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              관리자 세션 환경 변수가 없습니다.
              <pre className="mt-2 text-xs">{getMissingAdminEnvKeys().join("\n")}</pre>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              비밀번호가 올바르지 않습니다.
            </div>
          )}

          <form action={loginAdminAction} className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                관리자 비밀번호
              </span>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-[8px] bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              로그인
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
