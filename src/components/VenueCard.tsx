"use client";

import Link from "next/link";
import type { Venue } from "@/types/venue";
import { RADIUS_CONTROL, RADIUS_PANEL } from "@/lib/ui";

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
      className={`block cursor-pointer border bg-[rgba(11,14,20,0.95)] p-4 transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-400/50 ${RADIUS_PANEL} ${
        isSelected
          ? "border-primary-400/55 ring-2 ring-primary-400/25"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex gap-3.5">
        {venue.imageUrl ? (
          <div className={`h-16 w-16 shrink-0 overflow-hidden bg-[rgba(20,25,34,0.95)] ${RADIUS_CONTROL}`}>
            <img
              src={venue.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center bg-[rgba(20,25,34,0.95)] text-2xl ${RADIUS_CONTROL}`}>
            🎸
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-5 text-zinc-100">{venue.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-zinc-400">{venue.region}</p>
          {venue.address && (
            <p className="mt-1 truncate text-xs leading-5 text-zinc-500">{venue.address}</p>
          )}
          {venue.tags && venue.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {venue.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[rgba(20,25,34,0.9)] px-2 py-0.5 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* grid-rows 트릭으로 높이를 DOM 제거 없이 부드럽게 접고 펼침 */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
              isSelected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <Link
                href={`/venues/${venue.id}`}
                className={`mt-3 inline-flex items-center gap-1 bg-primary-400 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors duration-150 hover:bg-primary-300 ${RADIUS_CONTROL}`}
                onClick={(e) => e.stopPropagation()}
              >
                상세정보 보러가기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
