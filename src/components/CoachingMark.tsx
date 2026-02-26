"use client";

import { useEffect, useState } from "react";

interface CoachingMarkProps {
  /** localStorage 키 — 버튼마다 다르게 설정해서 따로 닫힘 */
  storageKey: string;
  text: string;
  /** 말풍선 꼭지 오른쪽 위치 (tailwind right-* 클래스, 기본 right-4) */
  tailRight?: string;
}

export function CoachingMark({
  storageKey,
  text,
  tailRight = "right-4",
}: CoachingMarkProps) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  function dismiss() {
    setDismissing(true);
  }

  function handleAnimationEnd() {
    if (dismissing) {
      localStorage.setItem(storageKey, "1");
      setVisible(false);
    }
  }

  return (
    <div
      role="tooltip"
      onAnimationEnd={handleAnimationEnd}
      className={`absolute right-0 top-full z-30 mt-2.5 flex items-center gap-2 whitespace-nowrap rounded-xl bg-zinc-900 py-2 pl-3 pr-1.5 text-xs font-medium text-white shadow-xl dark:bg-zinc-700 ${
        dismissing ? "animate-fade-out-up" : "animate-fade-in-down"
      }`}
    >
      {/* 꼭지 */}
      <div
        className={`absolute -top-1.5 ${tailRight} h-3 w-3 rotate-45 bg-zinc-900 dark:bg-zinc-700`}
        aria-hidden="true"
      />
      <span>{text}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="닫기"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors duration-150 hover:bg-white/20 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
