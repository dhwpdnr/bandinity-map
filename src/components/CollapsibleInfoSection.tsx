"use client";

import { useState } from "react";

interface CollapsibleInfoSectionProps {
  title: string;
  content?: string | null;
  emptyText: string;
}

export function CollapsibleInfoSection({
  title,
  content,
  emptyText,
}: CollapsibleInfoSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            {title}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="shrink-0 rounded-[10px] border border-white/12 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-primary-400/60 hover:text-primary-300"
        >
          {open ? "접기" : "눌러서 장비 보기"}
        </button>
      </div>

      {open && (
        <p className="mt-2.5 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
          {content || emptyText}
        </p>
      )}
    </section>
  );
}
