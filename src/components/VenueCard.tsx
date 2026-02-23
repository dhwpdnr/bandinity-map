"use client";

import Link from "next/link";
import type { Venue } from "@/types/venue";

interface VenueCardProps {
  venue: Venue;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function VenueCard({ venue, isSelected, onSelect }: VenueCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={`block cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:bg-zinc-900 dark:hover:shadow-zinc-900 ${
        isSelected
          ? "border-amber-500 ring-2 ring-amber-500/30 dark:border-amber-500"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex gap-3">
        {venue.imageUrl ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <img
              src={venue.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-2xl dark:bg-amber-900/30">
            🎸
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{venue.name}</h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{venue.region}</p>
          {venue.address && (
            <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-400">{venue.address}</p>
          )}
          {venue.tags && venue.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {venue.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {isSelected && (
            <Link
              href={`/venues/${venue.id}`}
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
              onClick={(e) => e.stopPropagation()}
            >
              상세정보 보러가기 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
