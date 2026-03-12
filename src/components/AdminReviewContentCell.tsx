"use client";

import { useRef } from "react";

interface AdminReviewContentCellProps {
  text: string;
}

export function AdminReviewContentCell({ text }: AdminReviewContentCellProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isEmpty = !text || !text.trim();
  const displayText = isEmpty ? "-" : text;

  return (
    <>
      <div className="flex items-start gap-2">
        <span
          className="min-w-0 flex-1 line-clamp-2 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400"
          title={displayText}
        >
          {displayText}
        </span>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="shrink-0 rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            전체 보기
          </button>
        )}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => {}}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        className="fixed left-1/2 top-1/2 m-0 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-0 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 [&::backdrop]:bg-black/50"
      >
        <div className="p-5">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            리뷰 전체 내용
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-800 dark:text-zinc-200">
            {displayText}
          </p>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              닫기
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
