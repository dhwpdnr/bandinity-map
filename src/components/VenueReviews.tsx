"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVenueReview } from "@/lib/reviews";
import type { VenueReview } from "@/types/review";
import { BUTTON_PRIMARY, INPUT_BASE, RADIUS_PANEL } from "@/lib/ui";

function formatDateFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
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
      await createVenueReview(venueId, trimmed);
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
    <section className={`mb-6 border border-white/10 bg-[rgba(11,14,20,0.92)] p-4 sm:p-6 ${RADIUS_PANEL}`}>
      <h2 className="mb-4 text-base font-semibold tracking-[-0.01em] text-zinc-100">
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
          className={`mb-2 resize-y ${INPUT_BASE}`}
          disabled={submitting}
        />
        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className={`${BUTTON_PRIMARY} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {submitting ? "등록 중…" : "리뷰 등록"}
        </button>
      </form>

      {initialReviews.length === 0 ? (
        <p className="text-sm text-zinc-400">아직 리뷰가 없어요. 첫 리뷰를 남겨 보세요!</p>
      ) : (
        <ul className="space-y-4">
          {initialReviews.map((review) => {
            const dateLabel = review.createdAt ? formatDateFromIso(review.createdAt) : "";
            return (
              <li
                key={review.id}
                className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
              >
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{review.text}</p>
                {dateLabel ? (
                  <p className="mt-1.5 text-xs text-zinc-400">{dateLabel}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
