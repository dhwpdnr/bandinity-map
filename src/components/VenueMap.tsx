"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useKakaoLoader, Map, MapMarker } from "react-kakao-maps-sdk";
import Link from "next/link";
import type { Venue } from "@/types/venue";

/** 카카오 인포윈도우가 감싸는 흰색 박스 배경 제거 */
function PopupContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      let parent: HTMLElement | null = el.parentElement;
      for (let i = 0; i < 6 && parent; i++) {
        parent.style.background = "transparent";
        parent.style.backgroundColor = "transparent";
        parent.style.border = "none";
        parent.style.boxShadow = "none";
        parent = parent.parentElement;
      }
    };
    run();
    const t = requestAnimationFrame(run);
    const timeout = setTimeout(run, 100);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(timeout);
    };
  }, []);
  return <div ref={ref}>{children}</div>;
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울

const makePin = (fill: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">`,
      `<filter id="s" x="-30%" y="-10%" width="160%" height="160%">`,
      `<feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>`,
      `</filter>`,
      `<g filter="url(#s)">`,
      `<path fill="${fill}" d="M15 2C8.373 2 3 7.373 3 14c0 8 12 23 12 23s12-15 12-23C27 7.373 21.627 2 15 2z"/>`,
      `<circle cx="15" cy="14" r="5.5" fill="white"/>`,
      `</g>`,
      `</svg>`,
    ].join("")
  )}`;

const MARKER_PIN_DEFAULT = makePin("#27272a");
const MARKER_PIN_SELECTED = makePin("#f59e0b");

const MARKER_SIZE = { width: 30, height: 40 };
const MARKER_OFFSET = { x: 15, y: 37 };

interface VenueMapProps {
  venues: Venue[];
  selectedId?: string | null;
  onSelectVenue?: (venue: Venue | null) => void;
}

export function VenueMap({ venues, selectedId, onSelectVenue }: VenueMapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY ?? "",
    libraries: ["services"],
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

  // 목록에서 공연장 선택 시 지도를 해당 마커 위치로 이동
  useEffect(() => {
    if (!selectedId || venues.length === 0) return;
    const venue = venues.find((v) => v.id === selectedId);
    if (venue) {
      setCenter({ lat: venue.lat, lng: venue.lng });
      setLevel(4);
    }
  }, [selectedId, venues]);

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
        {venues.map((venue) => {
          const isSelected = selectedId === venue.id;
          return (
            <MapMarker
              key={venue.id}
              position={{ lat: venue.lat, lng: venue.lng }}
              title={venue.name}
              clickable
              zIndex={isSelected ? 10 : 1}
              image={{
                src: isSelected ? MARKER_PIN_SELECTED : MARKER_PIN_DEFAULT,
                size: MARKER_SIZE,
                options: { offset: MARKER_OFFSET },
              }}
              onClick={() => handleMarkerClick(venue)}
            >
              {isSelected && (
                <PopupContent>
                  <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                    <p className="truncate max-w-[160px] text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {venue.name}
                    </p>
                    <Link
                      href={`/venues/${venue.id}`}
                      className="mt-0.5 block text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      상세정보 보러가기 →
                    </Link>
                  </div>
                </PopupContent>
              )}
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
}
