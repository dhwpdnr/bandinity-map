import Link from "next/link";
import type { PlaceSubmission } from "@/types/submission";

interface AdminSubmissionTableProps {
  submissions: PlaceSubmission[];
  action: (formData: FormData) => void | Promise<void>;
}

export function AdminSubmissionTable({
  submissions,
  action,
}: AdminSubmissionTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
        아직 들어온 제보가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {submissions.map((submission) => (
          <li key={submission.id} className="space-y-4 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-primary-400/15 px-2.5 py-1 font-medium text-primary-800 dark:bg-primary-400/20 dark:text-primary-200">
                    {submission.submissionType}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {submission.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {submission.draft.name || submission.targetPlaceId || "이름 없음"}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  제보자 {submission.submitterName}
                  {submission.submitterContact ? ` · ${submission.submitterContact}` : ""}
                  {` · ${submission.createdAt.slice(0, 10)}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {submission.targetPlaceId && (
                  <Link
                    href={`/admin/places/${submission.targetPlaceId}`}
                    className="rounded-[8px] border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
                  >
                    장소 편집
                  </Link>
                )}
                {submission.status === "pending" && (
                  <>
                    <form action={action}>
                      <input type="hidden" name="submissionId" value={submission.id} />
                      <input type="hidden" name="intent" value="approve" />
                      <button
                        type="submit"
                        className="rounded-[8px] bg-zinc-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                      >
                        승인
                      </button>
                    </form>
                    <form action={action}>
                      <input type="hidden" name="submissionId" value={submission.id} />
                      <input type="hidden" name="intent" value="reject" />
                      <input type="hidden" name="rejectionReason" value="운영자 검토 후 보완이 필요합니다." />
                      <button
                        type="submit"
                        className="rounded-[8px] border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      >
                        반려
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  주소
                </dt>
                <dd className="mt-1 text-zinc-700 dark:text-zinc-300">
                  {submission.draft.address || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  지역
                </dt>
                <dd className="mt-1 text-zinc-700 dark:text-zinc-300">
                  {submission.draft.region || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  예약 링크
                </dt>
                <dd className="mt-1 truncate text-zinc-700 dark:text-zinc-300">
                  {submission.draft.bookingLink || "-"}
                </dd>
              </div>
            </dl>

            {submission.message && (
              <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                {submission.message}
              </div>
            )}

            {submission.rejectionReason && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                반려 사유: {submission.rejectionReason}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
