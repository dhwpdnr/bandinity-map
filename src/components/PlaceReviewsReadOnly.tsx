import { createVenueReviewAction } from "@/app/actions";
import type { VenueReview } from "@/types/review";

interface PlaceReviewsReadOnlyProps {
  venueId: string;
  reviews: VenueReview[];
  embedded?: boolean;
}

export function PlaceReviewsReadOnly({
  venueId,
  reviews,
  embedded = false,
}: PlaceReviewsReadOnlyProps) {
  return (
    <section
      id="reviews"
      className={
        embedded
          ? "px-5 py-4 sm:px-6"
          : "rounded-[28px] border border-zinc-200/80 bg-white/90 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] dark:border-zinc-800 dark:bg-zinc-900/90"
      }
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        리뷰 ({reviews.length})
      </h2>

      <form action={createVenueReviewAction} className="mt-4 space-y-2.5">
        <input type="hidden" name="venueId" value={venueId} />
        <textarea
          name="text"
          rows={4}
          required
          placeholder="예: 무대 폭이 넓고 드럼/베이스 셋업이 편했습니다."
          className="w-full rounded-[14px] border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-[8px] bg-primary-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-primary-300"
          >
            리뷰 등록
          </button>
        </div>
      </form>

      {reviews.length === 0 ? (
        <p
          className={`mt-3 rounded-[16px] px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 ${
            embedded ? "bg-zinc-50 dark:bg-zinc-800/60" : "bg-zinc-50 dark:bg-zinc-800/60"
          }`}
        >
          아직 공개된 리뷰가 없습니다.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-[16px] bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
            >
              <p className="whitespace-pre-wrap leading-6">{review.text}</p>
              {review.createdAt && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {review.createdAt.slice(0, 10)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
