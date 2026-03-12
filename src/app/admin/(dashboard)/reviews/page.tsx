import Link from "next/link";
import { deleteAdminReviewAction } from "@/app/actions";
import { AdminDeleteReviewForm } from "@/components/AdminDeleteReviewForm";
import { AdminReviewContentCell } from "@/components/AdminReviewContentCell";
import { getAdminPlace, listAdminReviews } from "@/lib/admin-place-service";
import { getMissingAdminEnvKeys, hasAdminCredentials } from "@/lib/server-env";
import type { VenueReview } from "@/types/review";

export const dynamic = "force-dynamic";

interface AdminReviewsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const params = await searchParams;
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  const reviews = hasAdminCredentials() ? await listAdminReviews() : [];
  const venueIds = [...new Set(reviews.map((r) => r.venueId).filter(Boolean))];
  const placeNames: Record<string, string> = {};
  await Promise.all(
    venueIds.map(async (id) => {
      const place = await getAdminPlace(id);
      placeNames[id] = place?.name ?? "(알 수 없음)";
    })
  );

  return (
    <div className="p-4 md:p-5">
      <div className="w-full space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              리뷰
            </h1>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              공연장에 등록된 리뷰를 확인하고 삭제할 수 있습니다.
            </p>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            총 {reviews.length}건
          </p>

          {!hasAdminCredentials() && (
            <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              Firebase Admin SDK 환경 변수가 설정되지 않았습니다.
              <pre className="mt-2 text-xs">{getMissingAdminEnvKeys().join("\n")}</pre>
            </div>
          )}

          {success === "deleted" && (
            <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              리뷰를 삭제했습니다.
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
                등록된 리뷰가 없습니다.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        공연장
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        리뷰 내용
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        작성일
                      </th>
                      <th className="min-w-[4rem] px-4 py-3 text-right" aria-label="삭제">
                        삭제
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {reviews.map((review) => (
                      <AdminReviewRow
                        key={`${review.venueId}-${review.id}`}
                        review={review}
                        venueName={placeNames[review.venueId] ?? review.venueId}
                        deleteAction={deleteAdminReviewAction}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminReviewRow({
  review,
  venueName,
  deleteAction,
}: {
  review: VenueReview;
  venueName: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <tr className="bg-white transition hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3 align-middle">
        <Link
          href={`/admin/places/${review.venueId}`}
          className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-primary-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-primary-400"
        >
          {venueName}
        </Link>
      </td>
      <td className="max-w-md px-4 py-3 align-middle text-zinc-600 dark:text-zinc-400">
        <AdminReviewContentCell text={review.text} />
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-middle text-zinc-500 dark:text-zinc-400">
        {review.createdAt ? review.createdAt.slice(0, 10) : "-"}
      </td>
      <td className="min-w-[4rem] px-4 py-3 align-middle text-right">
        <div className="flex items-center justify-end">
          <AdminDeleteReviewForm
            venueId={review.venueId}
            reviewId={review.id}
            action={deleteAction}
          />
        </div>
      </td>
    </tr>
  );
}
