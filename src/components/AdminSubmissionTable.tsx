import Link from "next/link";
import type { PlaceSubmission, SubmissionDraft } from "@/types/submission";

const DRAFT_FIELD_LABELS: Record<keyof SubmissionDraft, string> = {
  name: "이름",
  placeType: "장소 유형",
  region: "지역",
  address: "주소",
  lat: "위도",
  lng: "경도",
  description: "설명",
  phone: "연락처",
  priceInfo: "가격 정보",
  equipment: "비치 장비",
  imageUrl: "대표 이미지",
  bookingLink: "예약 링크",
  tags: "태그",
  openDates: "오픈 일정",
  bookedDates: "예약 일정",
  inquiryDates: "문의 일정",
  availabilitySourceType: "가용성 소스",
  availabilitySourceUrl: "가용성 URL",
  sourceLinks: "참고 링크",
  verificationStatus: "검증 상태",
};

function formatDraftValue(value: unknown): string {
  if (value == null) return "-";
  if (Array.isArray(value)) {
    const first = value[0];
    if (first && typeof first === "object" && "url" in first) {
      return (value as Array<{ label?: string; url: string }>)
        .map((l) => (l.label ? `${l.label}: ${l.url}` : l.url))
        .join("\n");
    }
    return value.join(", ");
  }
  return String(value);
}

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  approved: "승인됨",
  rejected: "반려됨",
};

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  create: "신규 생성",
  edit: "수정",
  availability_update: "가용성 수정",
};

interface AdminSubmissionTableProps {
  submissions: PlaceSubmission[];
  targetPlaceNames?: Record<string, string>;
  action: (formData: FormData) => void | Promise<void>;
  emptyMessage?: string;
  variant?: "default" | "compact";
}

export function AdminSubmissionTable({
  submissions,
  targetPlaceNames = {},
  action,
  emptyMessage = "아직 들어온 제보가 없습니다.",
  variant = "default",
}: AdminSubmissionTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {submissions.map((submission) => {
            const displayName =
              submission.draft.name ??
              (submission.targetPlaceId
                ? (targetPlaceNames[submission.targetPlaceId] || submission.targetPlaceId)
                : null) ??
              "이름 없음";
            const statusLabel = STATUS_LABELS[submission.status] ?? submission.status;
            const typeLabel = SUBMISSION_TYPE_LABELS[submission.submissionType] ?? submission.submissionType;
            return (
              <li key={submission.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {displayName}
                  </span>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {typeLabel}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      submission.status === "approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : submission.status === "rejected"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    {submission.createdAt.slice(0, 10)}
                  </span>
                </div>
                {submission.targetPlaceId && (
                  <Link
                    href={`/admin/places/${submission.targetPlaceId}`}
                    className="shrink-0 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    장소 보기 →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {submissions.map((submission) => {
          const displayName =
            submission.draft.name ??
            (submission.targetPlaceId
              ? (targetPlaceNames[submission.targetPlaceId] || submission.targetPlaceId)
              : null) ??
            "이름 없음";
          const draftEntries = Object.entries(submission.draft).filter(
            ([, v]) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
          );
          return (
          <li key={submission.id} className="space-y-4 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-primary-400/15 px-2.5 py-1 font-medium text-primary-800 dark:bg-primary-400/20 dark:text-primary-200">
                    {SUBMISSION_TYPE_LABELS[submission.submissionType] ?? submission.submissionType}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {STATUS_LABELS[submission.status] ?? submission.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {displayName}
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
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
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
                        className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
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
                        className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      >
                        반려
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
              {draftEntries.length > 0 ? (
                draftEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      {DRAFT_FIELD_LABELS[key as keyof SubmissionDraft] ?? key}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                      {formatDraftValue(value)}
                    </dd>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400">제출된 필드가 없습니다.</p>
              )}
            </dl>

            {submission.message && (
              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                {submission.message}
              </div>
            )}

            {submission.rejectionReason && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                반려 사유: {submission.rejectionReason}
              </div>
            )}
          </li>
          );
        })}
      </ul>
    </div>
  );
}
