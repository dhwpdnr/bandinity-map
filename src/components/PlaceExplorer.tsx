"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getTodayDateString } from "@/lib/dates";
import {
  getRegionsByCount,
  sortPlacesByIntent,
} from "@/lib/place-utils";
import { Logo } from "@/components/Logo";
import { OneTimeCoachBubble } from "@/components/OneTimeCoachBubble";
import { PlaceList } from "@/components/PlaceList";
import { PlaceMap } from "@/components/PlaceMap";
import type { Place } from "@/types/place";

interface PlaceExplorerProps {
  places: Place[];
}

export function PlaceExplorer({ places }: PlaceExplorerProps) {
  const today = getTodayDateString();
  const mainCanvasRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [mobileCanvasHeight, setMobileCanvasHeight] = useState(0);
  const [mobileSheetSnap, setMobileSheetSnap] = useState<"collapsed" | "expanded">(
    "collapsed"
  );
  const [mobileDragTranslate, setMobileDragTranslate] = useState<number | null>(
    null
  );
  const regionMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileSheetDragRef = useRef<{
    startY: number;
    startTranslate: number;
    currentTranslate: number;
  } | null>(null);

  const mobileSheetHeight = mobileCanvasHeight * 0.72;
  const collapsedTranslate = Math.max(
    mobileSheetHeight - mobileCanvasHeight * 0.22,
    0
  );
  const expandedTranslate = Math.max(
    mobileSheetHeight - mobileCanvasHeight * 0.6,
    0
  );
  const mobileSheetTranslate =
    mobileDragTranslate ??
    (mobileSheetSnap === "expanded" ? expandedTranslate : collapsedTranslate);
  const isMobileViewport =
    typeof window !== "undefined" ? window.innerWidth < 640 : false;

  function clampSheetTranslate(value: number) {
    return Math.min(collapsedTranslate, Math.max(expandedTranslate, value));
  }

  useEffect(() => {
    if (!showRegionMenu) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!regionMenuRef.current?.contains(target)) {
        setShowRegionMenu(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowRegionMenu(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showRegionMenu]);

  useEffect(() => {
    if (typeof window === "undefined" || !mainCanvasRef.current) {
      return;
    }

    const node = mainCanvasRef.current;
    const measure = () => {
      window.requestAnimationFrame(() => {
        setMobileCanvasHeight(node.getBoundingClientRect().height);
      });
    };

    measure();

    const resizeObserver = new window.ResizeObserver(() => {
      measure();
    });

    resizeObserver.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const regions = ["전체", ...getRegionsByCount(places)];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const viewportPlaces = useMemo(
    () =>
      selectedRegion === "전체"
        ? places
        : places.filter((place) => place.region === selectedRegion),
    [places, selectedRegion]
  );

  const filteredPlaces = sortPlacesByIntent(
    places.filter((place) => {
      const matchesQuery =
        !normalizedQuery || place.name.toLowerCase().includes(normalizedQuery);
      const matchesRegion =
        selectedRegion === "전체" || place.region === selectedRegion;
      return matchesQuery && matchesRegion;
    }),
    today
  );

  const activeSelectedId =
    selectedId && filteredPlaces.some((place) => place.id === selectedId)
      ? selectedId
      : null;

  function handleRegionSelect(region: string) {
    setSelectedId(null);
    setSelectedRegion(region);
    setShowRegionMenu(false);
  }

  function handleSelectPlace(place: Place | null) {
    setSelectedId(place?.id ?? null);

    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setMobileSheetSnap("expanded");
    }
  }

  function handleMobileSheetPointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (typeof window === "undefined" || window.innerWidth >= 640) {
      return;
    }

    mobileSheetDragRef.current = {
      startY: event.clientY,
      startTranslate: mobileSheetTranslate,
      currentTranslate: mobileSheetTranslate,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const drag = mobileSheetDragRef.current;
      if (!drag) {
        return;
      }

      const nextTranslate = clampSheetTranslate(
        drag.startTranslate + (moveEvent.clientY - drag.startY)
      );
      drag.currentTranslate = nextTranslate;
      setMobileDragTranslate(nextTranslate);
    };

    const handlePointerEnd = () => {
      const currentTranslate =
        mobileSheetDragRef.current?.currentTranslate ?? mobileSheetTranslate;
      const midpoint = (collapsedTranslate + expandedTranslate) / 2;

      setMobileSheetSnap(currentTranslate <= midpoint ? "expanded" : "collapsed");
      setMobileDragTranslate(null);
      mobileSheetDragRef.current = null;

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
  }

  return (
    <div className="h-dvh overflow-hidden bg-[#36363a] px-2 py-2.5 text-white sm:min-h-dvh sm:h-auto sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="mx-auto flex h-full max-w-[420px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(44,48,62,0.34),_transparent_30%),linear-gradient(180deg,#06080d_0%,#020409_100%)] shadow-[0_30px_90px_-52px_rgba(0,0,0,0.92)] sm:h-auto sm:max-w-[760px] sm:rounded-[30px] lg:max-w-[1280px] lg:rounded-[34px]">
        <header className="border-b border-white/10 px-3.5 sm:px-6 lg:px-8">
          <div className="flex min-h-[60px] items-center gap-2.5 sm:min-h-[64px] sm:gap-4 lg:min-h-[68px] lg:gap-6">
            <div className="shrink-0">
              <Logo />
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="flex overflow-hidden rounded-[16px] border border-white/12 bg-[linear-gradient(90deg,rgba(29,31,40,0.98),rgba(41,43,53,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_28px_-24px_rgba(0,0,0,0.95)] sm:rounded-[20px] lg:rounded-[22px]">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="공연장 이름 검색"
                  className="min-w-0 flex-1 bg-transparent px-3.5 py-2 text-[13px] text-white outline-none placeholder:text-zinc-500 sm:px-5 sm:py-2.5 sm:text-[15px] lg:px-6 lg:py-3 lg:text-base"
                />
              </div>
            </div>
          </div>
        </header>

        <main
          ref={mainCanvasRef}
          className="relative flex-1 overflow-hidden px-3.5 py-3 sm:block sm:px-6 sm:py-5 lg:grid lg:grid-cols-[minmax(0,1.1fr)_380px] lg:gap-6 lg:px-8 lg:py-6"
        >
          <section className="absolute inset-3 sm:static sm:sticky sm:top-4 sm:h-[35vh] sm:min-h-[300px] lg:top-6 lg:h-[calc(100dvh-220px)] lg:min-h-[520px]">
            <PlaceMap
              places={filteredPlaces}
              fitPlaces={viewportPlaces}
              selectedId={activeSelectedId}
              onSelectPlace={handleSelectPlace}
              countLabel={`${filteredPlaces.length}개 공연장`}
              resultsFocusOffset="upper"
              resultsFitToken={selectedRegion}
            />
          </section>

          <aside
            className="absolute inset-x-3 bottom-3 z-10 flex h-[72%] flex-col overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,10,16,0.97),rgba(4,6,10,0.995))] shadow-[0_-28px_64px_-36px_rgba(0,0,0,0.98)] sm:static sm:mt-4 sm:block sm:h-auto sm:overflow-visible sm:rounded-[24px] sm:px-4 sm:py-4 sm:shadow-none lg:mt-0 lg:rounded-[28px] lg:px-4 lg:pb-4 lg:pt-4"
            style={
              isMobileViewport && mobileCanvasHeight > 0
                ? {
                    transform: `translateY(${mobileSheetTranslate}px)`,
                    transition:
                      mobileDragTranslate === null
                        ? "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)"
                        : "none",
                  }
                : undefined
            }
          >
            <div
              role="presentation"
              onPointerDown={handleMobileSheetPointerDown}
              className="touch-none px-3 pt-4 sm:hidden"
            >
              <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-white/12" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 sm:block sm:px-0 sm:pb-0">
              <div className="relative mb-3 flex items-center justify-between gap-3 sm:mb-5" ref={regionMenuRef}>
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="min-w-0 text-[15px] font-semibold tracking-[-0.03em] text-zinc-300 sm:text-lg lg:text-[1.2rem]">
                    공연장 목록 ({filteredPlaces.length}곳)
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowRegionMenu((current) => !current)}
                    className="inline-flex min-w-0 items-center gap-1.5 rounded-[8px] border border-white/10 bg-[rgba(23,26,34,0.96)] px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 transition hover:border-white/20 hover:bg-[rgba(30,34,44,0.98)] sm:rounded-[10px] sm:px-3 sm:py-2 sm:text-xs"
                  >
                    <span className="text-zinc-400">지역</span>
                    <span className="truncate text-white">{selectedRegion}</span>
                    <span
                      aria-hidden
                      className={`text-[10px] text-zinc-500 transition ${
                        showRegionMenu ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                </div>

                <OneTimeCoachBubble
                  storageKey="coach:add-venue:v1"
                  message="목록에 없는 공연장을 추가할 수 있어요"
                >
                  <Link
                    href="/venues/new"
                    className="shrink-0 rounded-[8px] bg-primary-400 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-950 transition hover:bg-primary-300 sm:rounded-[10px] sm:px-3 sm:py-2 sm:text-xs lg:px-3.5"
                  >
                    + 공연장 추가
                  </Link>
                </OneTimeCoachBubble>

                {showRegionMenu && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[min(320px,calc(100vw-72px))] rounded-[18px] border border-white/10 bg-[rgba(13,16,22,0.98)] p-2.5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.96)] backdrop-blur sm:w-[360px] sm:rounded-[22px] sm:p-3">
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {regions.map((region) => (
                        <button
                          key={region}
                          type="button"
                          onClick={() => handleRegionSelect(region)}
                          className={`rounded-[8px] px-2.5 py-2 text-[11px] font-medium transition sm:rounded-[10px] sm:px-3 sm:py-2.5 sm:text-xs ${
                            selectedRegion === region
                              ? "bg-primary-400 text-zinc-950"
                              : "bg-[rgba(74,76,88,0.52)] text-zinc-200 hover:bg-[rgba(90,93,108,0.82)]"
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="-mx-1 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 pb-8 pt-1 sm:mx-0 sm:max-h-[52dvh] sm:px-0 sm:pb-6 lg:max-h-[calc(100dvh-340px)] lg:pr-2 lg:pb-8">
                <PlaceList
                  places={filteredPlaces}
                  selectedId={activeSelectedId}
                  onSelectPlace={handleSelectPlace}
                />
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
