import Link from "next/link";
import { decideSubmissionAction, logoutAdminAction } from "@/app/actions";
import { AdminSubmissionTable } from "@/components/AdminSubmissionTable";
import { SiteHeader } from "@/components/SiteHeader";
import { requireAdminSession } from "@/lib/admin-auth";
import { listAdminSubmissions } from "@/lib/admin-place-service";
import { getMissingAdminEnvKeys, hasAdminCredentials } from "@/lib/server-env";

export const dynamic = "force-dynamic";

interface AdminSubmissionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminSubmissionsPage({
  searchParams,
}: AdminSubmissionsPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80" containerClassName="max-w-6xl" />
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition hover:text-primary-700 dark:text-zinc-400 dark:hover:text-primary-300"
          >
            공개 홈
          </Link>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="text-sm font-medium text-zinc-600 transition hover:text-primary-700 dark:text-zinc-300 dark:hover:text-primary-300"
            >
              로그아웃
            </button>
          </form>
        </div>

        <section className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Review Queue
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            제보 검토
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            신규 장소 생성, 기존 장소 수정, 날짜별 가용성 제보를 승인하거나 반려할 수 있습니다.
          </p>

          {!hasAdminCredentials() && (
            <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              Firebase Admin SDK 환경 변수가 설정되지 않았습니다.
              <pre className="mt-2 text-xs">{getMissingAdminEnvKeys().join("\n")}</pre>
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              요청을 처리했습니다.
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            <AdminSubmissionTable
              submissions={hasAdminCredentials() ? await listAdminSubmissions() : []}
              action={decideSubmissionAction}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
