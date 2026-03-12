import Link from "next/link";
import { notFound } from "next/navigation";
import { adminUpdateVenueAction, deleteAdminPlaceAction, deleteAdminReviewAction } from "@/app/actions";
import { AdminDeletePlaceForm } from "@/components/AdminDeletePlaceForm";
import { AdminDeleteReviewForm } from "@/components/AdminDeleteReviewForm";
import { VenueForm } from "@/components/VenueForm";
import { getAdminPlace } from "@/lib/admin-place-service";
import { getPlaceReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

interface AdminPlacePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPlacePage({
  params,
  searchParams,
}: AdminPlacePageProps) {
  const { id } = await params;
  const place = await getAdminPlace(id);
  const query = await searchParams;
  const success = Array.isArray(query.success) ? query.success[0] : query.success;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  if (!place) {
    notFound();
  }

  const reviews = await getPlaceReviews(place.id);

  return (
    <div className="p-4 md:p-5">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/admin/places"
            className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← 공연장 목록
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <Link
            href={`/places/${place.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            공개 상세 보기 →
          </Link>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            장소 정보 수정
          </h1>

          {(success === "1" || success === "review-deleted") && (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              {success === "review-deleted" ? "리뷰를 삭제했습니다." : "저장했습니다."}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {error === "missing-required"
                ? "이름, 지역, 주소는 필수입니다."
                : error === "address-search-required"
                  ? "주소를 수정했다면 검색 버튼으로 위치를 다시 확인해 주세요."
                  : decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            <VenueForm
              action={adminUpdateVenueAction}
              initialPlace={place}
              submitLabel="수정 사항 저장"
              cancelHref="/admin/places"
            />
          </div>

          <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              리뷰 ({reviews.length})
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              이 공연장에 등록된 리뷰입니다. 삭제 시 복구할 수 없습니다.
            </p>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                등록된 리뷰가 없습니다.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                        {review.text}
                      </p>
                      {review.createdAt && (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {review.createdAt.slice(0, 10)}
                        </p>
                      )}
                    </div>
                    <AdminDeleteReviewForm
                      venueId={place.id}
                      reviewId={review.id}
                      action={deleteAdminReviewAction}
                      returnTo={`/admin/places/${place.id}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              삭제
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              이 공연장을 목록에서 완전히 제거합니다. 복구할 수 없습니다.
            </p>
            <div className="mt-3">
              <AdminDeletePlaceForm
                placeId={place.id}
                placeName={place.name}
                action={deleteAdminPlaceAction}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
