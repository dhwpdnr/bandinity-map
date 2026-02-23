"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getVenues } from "@/lib/venues";
import { VenueMap } from "@/components/VenueMap";
import { VenueList } from "@/components/VenueList";
import { Logo } from "@/components/Logo";
import type { Venue } from "@/types/venue";

/** 지역별 개수 세서 많은 순 정렬 (전체 제외) */
function getRegionsByCount(venues: Venue[]): string[] {
  const count: Record<string, number> = {};
  for (const v of venues) {
    if (v.region) count[v.region] = (count[v.region] ?? 0) + 1;
  }
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([region]) => region);
}

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");

  const loadVenues = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getVenues();
      setVenues(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const regionChips = ["전체", ...getRegionsByCount(venues)];
  const filteredVenues =
    selectedRegion === "전체"
      ? venues
      : venues.filter((v) => v.region === selectedRegion);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/95 dark:supports-[backdrop-filter]:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1><Logo /></h1>
          <Link
            href="/venues/new"
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            <span className="text-base leading-none">+</span>
            공연장 추가
          </Link>
        </div>
      </header>

      {/* PC: 지도 고정, 오른쪽 목록만 스크롤 / 모바일: 지도 상단 고정, 목록만 스크롤 */}
      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row md:gap-6 md:p-6">
        {/* 지도: 모바일에서 상단 고정 높이, PC에서 flex로 남은 높이 채움 */}
        <section className="flex shrink-0 flex-col md:min-h-0 md:flex-1 md:basis-0">
          <div className="h-[280px] w-full sm:h-[320px] md:h-full md:min-h-[420px]">
            <VenueMap
              venues={filteredVenues}
              selectedId={selectedId}
              onSelectVenue={(v) => setSelectedId(v?.id ?? null)}
            />
          </div>
        </section>

        {/* 목록: 이 영역만 스크롤 */}
        <aside className="flex min-h-0 flex-1 flex-col md:w-[360px] md:flex-initial md:shrink-0 lg:w-[400px]">
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              공연장 목록 ({filteredVenues.length}곳)
            </h2>
          </div>
          {!loading && regionChips.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {regionChips.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    selectedRegion === region
                      ? "bg-amber-500 text-white dark:bg-amber-600"
                      : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-xl border border-zinc-200 bg-white py-12 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              로딩 중...
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <VenueList
                venues={filteredVenues}
                selectedId={selectedId}
                onSelectVenue={(v) => setSelectedId(v?.id ?? null)}
              />
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
