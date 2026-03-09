"use client";

import { useEffect, useRef } from "react";
import { PlaceCard } from "@/components/PlaceCard";
import type { Place } from "@/types/place";

interface PlaceListProps {
  places: Place[];
  selectedId?: string | null;
  onSelectPlace?: (place: Place | null) => void;
}

export function PlaceList({
  places,
  selectedId,
  onSelectPlace,
}: PlaceListProps) {
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    if (!selectedId) return;
    const node = itemRefs.current.get(selectedId);
    node?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  if (places.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-white/12 bg-[rgba(14,16,22,0.9)] p-5 text-center text-[12px] text-zinc-400 sm:rounded-[24px] sm:p-8 sm:text-sm">
        조건에 맞는 장소가 없습니다. 필터를 조금 넓혀 보세요.
      </div>
    );
  }

  return (
    <ul className="grid overflow-visible gap-2.5 sm:gap-3.5 lg:gap-4">
      {places.map((place) => (
        <li
          key={place.id}
          className="min-w-0 px-0.5"
          ref={(node) => {
            if (node) itemRefs.current.set(place.id, node);
            else itemRefs.current.delete(place.id);
          }}
        >
          <PlaceCard
            place={place}
            isSelected={selectedId === place.id}
            onSelect={() => onSelectPlace?.(place)}
          />
        </li>
      ))}
    </ul>
  );
}
