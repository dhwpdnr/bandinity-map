"use client";

import { useRef } from "react";

const CONFIRM_MESSAGE = "정말 이 공연장을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.";

interface AdminDeletePlaceFormProps {
  placeId: string;
  placeName: string;
  action: (formData: FormData) => void | Promise<void>;
}

export function AdminDeletePlaceForm({
  placeId,
  placeName,
  action,
}: AdminDeletePlaceFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.confirm(CONFIRM_MESSAGE)) return;
    const form = formRef.current;
    if (form) action(new FormData(form));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="placeId" value={placeId} />
      <button
        type="submit"
        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
        title={placeName}
      >
        공연장 삭제
      </button>
    </form>
  );
}
