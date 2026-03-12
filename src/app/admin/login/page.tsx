import { redirect } from "next/navigation";
import { loginAdminAction } from "@/app/actions";
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
    redirect("/admin");
  }

  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <section className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              관리자 로그인
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              비밀번호를 입력하세요.
            </p>
          </div>

          {!hasAdminSessionConfig() && (
            <div className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              관리자 세션 환경 변수가 없습니다.
              <pre className="mt-2 text-xs">{getMissingAdminEnvKeys().join("\n")}</pre>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
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
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              로그인
            </button>
          </form>
        </section>
    </div>
  );
}
