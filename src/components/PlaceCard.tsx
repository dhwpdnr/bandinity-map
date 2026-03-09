"use client";

import Image from "next/image";
import Link from "next/link";
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
      className={`group cursor-pointer rounded-[18px] border p-2.5 transition duration-200 sm:rounded-[22px] sm:p-3.5 lg:rounded-[24px] lg:p-4 ${
        isSelected
          ? "border-primary-400/80 bg-[linear-gradient(120deg,rgba(19,24,33,0.98),rgba(16,18,26,0.98))]"
          : "border-white/10 bg-[linear-gradient(120deg,rgba(21,24,31,0.96),rgba(12,14,20,0.96))] shadow-[0_26px_64px_-46px_rgba(0,0,0,0.95)] hover:border-white/20"
      }`}
    >
      <div className="flex min-w-0 items-start gap-2.5 sm:gap-3.5 lg:gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,#23252f,#11131a)] ring-1 ring-white/6 sm:h-[64px] sm:w-[64px] sm:rounded-[16px] lg:h-[72px] lg:w-[72px] lg:rounded-[18px]">
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
                className="inline-flex items-center gap-1 rounded-[8px] bg-primary-400 px-3 py-1.5 text-[11px] font-semibold text-zinc-950 transition hover:bg-primary-300 sm:rounded-[10px] sm:px-3.5 sm:py-2 sm:text-xs"
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
