import { createVenueReviewAction } from "@/app/actions";
import type { VenueReview } from "@/types/review";
import { BUTTON_PRIMARY, INPUT_BASE } from "@/lib/ui";

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
          : "rounded-[28px] border border-white/10 bg-[rgba(11,14,20,0.92)] p-5 shadow-[0_14px_36px_-28px_rgba(0,0,0,0.74)]"
      }
    >
      <h2 className="text-lg font-semibold text-zinc-100">
        리뷰 ({reviews.length})
      </h2>

      <form action={createVenueReviewAction} className="mt-4 space-y-2.5">
        <input type="hidden" name="venueId" value={venueId} />
        <textarea
          name="text"
          rows={4}
          required
          placeholder="예: 무대 폭이 넓고 드럼/베이스 셋업이 편했습니다."
          className={INPUT_BASE}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className={`${BUTTON_PRIMARY} px-4 py-2`}
          >
            리뷰 등록
          </button>
        </div>
      </form>

      {reviews.length === 0 ? (
        <p
          className={`mt-3 rounded-[16px] px-4 py-3 text-sm text-zinc-400 ${
            embedded ? "bg-[rgba(16,21,30,0.8)]" : "bg-[rgba(16,21,30,0.8)]"
          }`}
        >
          아직 공개된 리뷰가 없습니다.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-[16px] bg-[rgba(16,21,30,0.8)] px-4 py-3 text-sm text-zinc-300"
            >
              <p className="whitespace-pre-wrap leading-6">{review.text}</p>
              {review.createdAt && (
                <p className="mt-2 text-xs text-zinc-400">
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
