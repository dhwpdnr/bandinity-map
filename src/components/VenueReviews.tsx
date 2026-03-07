"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addVenueReview } from "@/lib/reviews";
import type { VenueReview } from "@/types/review";

function formatDate(seconds: number): string {
  const d = new Date(seconds * 1000);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

interface VenueReviewsProps {
  venueId: string;
  initialReviews: VenueReview[];
}

export function VenueReviews({ venueId, initialReviews }: VenueReviewsProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("리뷰 내용을 입력해 주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await addVenueReview(venueId, trimmed);
      setText("");
      router.refresh();
    } catch (err: unknown) {
      const isPermissionDenied =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "permission-denied";
      setError(
        isPermissionDenied
          ? "리뷰 작성 권한이 없습니다. Firebase 콘솔에서 Firestore 규칙을 배포해 주세요."
          : "리뷰 등록에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        리뷰 {initialReviews.length > 0 && `(${initialReviews.length})`}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <label htmlFor="review-text" className="sr-only">
          리뷰 작성
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="이 공연장에 대한 리뷰를 남겨 주세요."
          rows={3}
          maxLength={1000}
          className="mb-2 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-amber-500 dark:focus:ring-amber-500"
          disabled={submitting}
        />
        {error && <p className="mb-2 text-xs text-red-500 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {submitting ? "등록 중…" : "리뷰 등록"}
        </button>
      </form>

      {initialReviews.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 리뷰가 없어요. 첫 리뷰를 남겨 보세요!</p>
      ) : (
        <ul className="space-y-4">
          {initialReviews.map((review) => (
            <li
              key={review.id}
              className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800"
            >
              <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">{review.text}</p>
              {review.createdAt?.seconds != null && (
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(review.createdAt.seconds)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
