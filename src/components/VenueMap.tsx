"use client";

import { useCallback, useState } from "react";
import { useKakaoLoader, Map, MapMarker } from "react-kakao-maps-sdk";
import Link from "next/link";
import type { Venue } from "@/types/venue";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울

interface VenueMapProps {
  venues: Venue[];
  selectedId?: string | null;
  onSelectVenue?: (venue: Venue | null) => void;
}

export function VenueMap({ venues, selectedId, onSelectVenue }: VenueMapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY ?? "",
  });
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [level, setLevel] = useState(8);

  const handleMarkerClick = useCallback(
    (venue: Venue) => {
      setCenter({ lat: venue.lat, lng: venue.lng });
      setLevel(4);
      onSelectVenue?.(venue);
    },
    [onSelectVenue]
  );

  if (error) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl bg-zinc-100 p-4 text-center text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        지도를 불러오는 중 오류가 발생했습니다. 카카오 지도 API 키를 확인해 주세요.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">지도 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-xl">
      <Map
        center={center}
        level={level}
        className="h-full w-full"
        isPanto
        onClick={() => onSelectVenue?.(null)}
      >
        {venues.map((venue) => (
          <MapMarker
            key={venue.id}
            position={{ lat: venue.lat, lng: venue.lng }}
            title={venue.name}
            clickable
            onClick={() => handleMarkerClick(venue)}
          >
            {selectedId === venue.id && (
              <div className="rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
                <Link
                  href={`/venues/${venue.id}`}
                  className="font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {venue.name}
                </Link>
              </div>
            )}
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
