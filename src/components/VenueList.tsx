"use client";

import { VenueCard } from "./VenueCard";
import type { Venue } from "@/types/venue";

interface VenueListProps {
  venues: Venue[];
  selectedId?: string | null;
  onSelectVenue?: (venue: Venue | null) => void;
}

export function VenueList({ venues, selectedId, onSelectVenue }: VenueListProps) {
  if (venues.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        등록된 공연장이 없습니다.
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {venues.map((venue) => (
        <li key={venue.id}>
          <VenueCard
            venue={venue}
            isSelected={selectedId === venue.id}
            onSelect={() => onSelectVenue?.(venue)}
          />
        </li>
      ))}
    </ul>
  );
}
