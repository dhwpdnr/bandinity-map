"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface OneTimeCoachBubbleProps {
  storageKey: string;
  message: string;
  children: ReactNode;
  className?: string;
  bubbleClassName?: string;
  /** top: 버튼 위(기본). bottom: 버튼 아래 — 헤더/overflow에 가려질 때 사용 */
  placement?: "top" | "bottom";
}

export function OneTimeCoachBubble({
  storageKey,
  message,
  children,
  className,
  bubbleClassName,
  placement = "top",
}: OneTimeCoachBubbleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.localStorage.getItem(storageKey) === "1") {
      return;
    }

    window.localStorage.setItem(storageKey, "1");
    const frameId = window.requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [storageKey]);

  const bubblePosition =
    placement === "bottom"
      ? "top-[calc(100%+10px)]"
      : "bottom-[calc(100%+10px)]";
  const tailClass =
    placement === "bottom"
      ? "absolute -top-1.5 right-5 h-3 w-3 rotate-45 border-l border-t border-white/10 bg-[rgb(14,16,22)]"
      : "absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-[rgb(14,16,22)]";

  return (
    <div className={`relative inline-flex ${className ?? ""}`}>
      {visible && (
        <div
          className={`absolute ${bubblePosition} right-0 z-50 w-[220px] rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,24,31,0.98),rgba(14,16,22,0.98))] px-3 py-2.5 text-[11px] leading-5 text-zinc-200 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.85)] sm:w-[240px] sm:text-xs ${bubbleClassName ?? ""}`}
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setVisible(false)}
            className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center text-[11px] text-zinc-500 transition hover:text-white"
          >
            ×
          </button>
          <p className="pr-5">{message}</p>
          <div className={tailClass} />
        </div>
      )}
      {children}
    </div>
  );
}
