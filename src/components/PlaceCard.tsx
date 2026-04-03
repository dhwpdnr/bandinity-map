"use client";

import Image from "next/image";
import Link from "next/link";
import { RADIUS_CONTROL, RADIUS_PANEL } from "@/lib/ui";
import type { Place } from "@/types/place";

interface PlaceCardProps {
  place: Place;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function PlaceCard({ place, isSelected, onSelect }: PlaceCardProps) {
  const thumbnail = place.imageUrl || place.photos?.[0] || null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      className={`group cursor-pointer border p-2.5 transition-colors duration-200 sm:p-3.5 lg:p-4 ${RADIUS_PANEL} ${
        isSelected
          ? "border-primary-400/55 bg-[rgba(14,18,25,0.96)]"
          : "border-white/10 bg-[rgba(11,14,20,0.95)] hover:border-white/20"
      }`}
    >
      <div className="flex min-w-0 items-start gap-2.5 sm:gap-3.5 lg:gap-4">
        <div className={`relative h-12 w-12 shrink-0 overflow-hidden bg-[rgba(20,25,34,0.95)] ring-1 ring-white/8 sm:h-[64px] sm:w-[64px] lg:h-[72px] lg:w-[72px] ${RADIUS_CONTROL}`}>
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={place.name}
              fill
              className="object-cover"
              sizes="(max-width: 639px) 48px, (max-width: 1023px) 64px, 72px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-lg sm:text-2xl">
              {place.placeType === "studio" ? "🥁" : "🎸"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold leading-5 tracking-[-0.02em] break-words text-white sm:text-base lg:text-lg">
            {place.name}
          </h3>
          <p className="mt-0.5 break-words text-[11px] font-medium leading-4 text-zinc-400 sm:text-sm">
            {place.region}
          </p>
          <p className="mt-1 break-words text-[11px] leading-4 text-zinc-500 sm:text-sm sm:leading-5">
            {place.address}
          </p>

          {isSelected && (
            <div className="mt-2.5 sm:mt-3">
              <Link
                href={`/places/${place.id}`}
                onClick={(event) => event.stopPropagation()}
              className={`inline-flex items-center gap-1 bg-primary-400 px-3 py-1.5 text-[11px] font-semibold text-zinc-950 transition hover:bg-primary-300 sm:px-3.5 sm:py-2 sm:text-xs ${RADIUS_CONTROL}`}
              >
                상세정보 보러가기
                <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
