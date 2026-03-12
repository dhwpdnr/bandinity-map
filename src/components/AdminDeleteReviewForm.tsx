"use client";

import { useRef } from "react";

const CONFIRM_MESSAGE = "이 리뷰를 삭제하시겠습니까?";

interface AdminDeleteReviewFormProps {
  venueId: string;
  reviewId: string;
  action: (formData: FormData) => void | Promise<void>;
  /** 삭제 후 이동할 URL (예: /admin/places/xxx) */
  returnTo?: string;
}

export function AdminDeleteReviewForm({
  venueId,
  reviewId,
  action,
  returnTo,
}: AdminDeleteReviewFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.confirm(CONFIRM_MESSAGE)) return;
    const form = formRef.current;
    if (form) action(new FormData(form));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="venueId" value={venueId} />
      <input type="hidden" name="reviewId" value={reviewId} />
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      <button
        type="submit"
        className="whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
      >
        삭제
      </button>
    </form>
  );
}
