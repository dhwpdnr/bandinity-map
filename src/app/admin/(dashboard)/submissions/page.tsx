import { decideSubmissionAction } from "@/app/actions";
import { AdminSubmissionTable } from "@/components/AdminSubmissionTable";
import { listAdminSubmissions } from "@/lib/admin-place-service";
import { getPlaceById } from "@/lib/places";
import { getMissingAdminEnvKeys, hasAdminCredentials } from "@/lib/server-env";
import type { PlaceSubmission } from "@/types/submission";

export const dynamic = "force-dynamic";

const DECIDED_LIST_LIMIT = 15;

async function getTargetPlaceNamesForSubmissions(
  submissions: PlaceSubmission[]
): Promise<Record<string, string>> {
  const ids = [...new Set(submissions.map((s) => s.targetPlaceId).filter(Boolean))] as string[];
  const places = await Promise.all(ids.map((id) => getPlaceById(id)));
  return Object.fromEntries(ids.map((id, i) => [id, places[i]?.name ?? ""]));
}

interface AdminSubmissionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminSubmissionsPage({
  searchParams,
}: AdminSubmissionsPageProps) {
  const params = await searchParams;
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  const allSubmissions = hasAdminCredentials() ? await listAdminSubmissions() : [];
  const pendingSubmissions = allSubmissions.filter((s) => s.status === "pending");
  const decidedSubmissions = allSubmissions
    .filter((s) => s.status === "approved" || s.status === "rejected")
    .slice(0, DECIDED_LIST_LIMIT);

  const targetPlaceNames = hasAdminCredentials()
    ? await getTargetPlaceNamesForSubmissions(allSubmissions)
    : {};

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            제보 검토
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            올라온 생성·수정 요청을 확인하고 승인 시 바로 반영됩니다. 대기 중인 요청을 먼저 처리하세요.
          </p>

          {!hasAdminCredentials() && (
            <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              Firebase Admin SDK 환경 변수가 설정되지 않았습니다.
              <pre className="mt-2 text-xs">{getMissingAdminEnvKeys().join("\n")}</pre>
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              요청을 처리했습니다.
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              대기 중인 요청 ({pendingSubmissions.length}건)
            </h2>
            <AdminSubmissionTable
              submissions={pendingSubmissions}
              targetPlaceNames={targetPlaceNames}
              action={decideSubmissionAction}
              emptyMessage="대기 중인 요청이 없습니다."
            />
          </div>

          {decidedSubmissions.length > 0 && (
            <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                처리 완료된 제보 (최근 {decidedSubmissions.length}건)
              </h2>
              <AdminSubmissionTable
                submissions={decidedSubmissions}
                targetPlaceNames={targetPlaceNames}
                action={decideSubmissionAction}
                variant="compact"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
