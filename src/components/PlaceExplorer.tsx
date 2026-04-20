"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getTodayDateString } from "@/lib/dates";
import { HEADER_PADDING, PAGE_MAX_WIDTH } from "@/lib/layout";
import { BUTTON_PRIMARY, PANEL_SURFACE, RADIUS_CONTROL } from "@/lib/ui";
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
  const searchParams = useSearchParams();
  const today = getTodayDateString();
  const mainCanvasRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateSuccess, setShowCreateSuccess] = useState(() =>
    searchParams.get("success") === "submitted"
  );
  const [isCreateSuccessClosing, setIsCreateSuccessClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [mobileCanvasHeight, setMobileCanvasHeight] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
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

  function clampSheetTranslate(value: number) {
    return Math.min(collapsedTranslate, Math.max(expandedTranslate, value));
  }

  useEffect(() => {
    if (searchParams.get("success") === "submitted") {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showCreateSuccess || isCreateSuccessClosing) return;
    const timer = window.setTimeout(() => setIsCreateSuccessClosing(true), 6000);
    return () => window.clearTimeout(timer);
  }, [showCreateSuccess, isCreateSuccessClosing]);

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

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !mainCanvasRef.current) {
      return;
    }

    const node = mainCanvasRef.current;
    const measure = () => {
      const height = node.getBoundingClientRect().height;
      setMobileCanvasHeight(height);
      setIsMobileViewport(window.innerWidth < 640);
    };

    measure();

    const resizeObserver = new window.ResizeObserver(() => {
      window.requestAnimationFrame(measure);
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

    if (isMobileViewport) {
      setMobileSheetSnap("expanded");
    }
  }

  function handleMobileSheetPointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!isMobileViewport) {
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
    <div className="h-dvh overflow-hidden bg-[var(--surface-app)] text-white sm:min-h-dvh sm:h-auto sm:bg-[var(--surface-app-alt)]">
      <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--surface-app)] sm:h-auto sm:rounded-none sm:border-0 sm:shadow-none">
        <header className="border-b border-white/10">
          <div className={`mx-auto ${PAGE_MAX_WIDTH} ${HEADER_PADDING}`}>
            <div className="flex min-h-[60px] items-center gap-2.5 sm:min-h-[64px] sm:gap-4 lg:min-h-[68px] lg:gap-5">
              <div className="shrink-0">
                <Logo />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex overflow-hidden rounded-[16px] border border-white/12 bg-[rgba(13,16,23,0.96)] sm:rounded-[20px]">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="공연장 이름 검색"
                  className="min-w-0 flex-1 bg-transparent px-3.5 py-2 text-[13px] text-white outline-none placeholder:text-zinc-500 sm:px-5 sm:py-2.5 sm:text-[15px] lg:px-6 lg:py-2.5 lg:text-[15px]"
                />
                </div>
              </div>
            </div>
          </div>
        </header>

        {showCreateSuccess && (
          <div
            className={`overflow-hidden border-b border-emerald-500/30 bg-emerald-500/15 px-4 py-3 transition-all duration-300 ease-out sm:px-6 lg:px-8 ${
              isCreateSuccessClosing ? "max-h-0 opacity-0 py-0" : "max-h-28 opacity-100"
            }`}
            onTransitionEnd={() => {
              if (isCreateSuccessClosing) setShowCreateSuccess(false);
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-emerald-200 sm:text-base">
                생성 요청이 완료되었습니다. 내용 검토 후 반영됩니다.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateSuccessClosing(true)}
                className="shrink-0 rounded-lg px-2 py-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main
          ref={mainCanvasRef}
          className="relative flex-1 overflow-hidden sm:block sm:px-6 sm:py-5 lg:grid lg:grid-cols-[minmax(0,1.1fr)_380px] lg:gap-6 lg:px-8 lg:py-6"
        >
          <section className="absolute inset-0 sm:static sm:sticky sm:top-4 sm:h-[35vh] sm:min-h-[300px] lg:top-6 lg:h-[calc(100dvh-220px)] lg:min-h-[520px]">
            <PlaceMap
              places={filteredPlaces}
              fitPlaces={viewportPlaces}
              selectedId={activeSelectedId}
              onSelectPlace={handleSelectPlace}
              resultsFocusOffset="upper"
              resultsFitToken={selectedRegion}
            />
          </section>

          <aside
            className={`${PANEL_SURFACE} absolute inset-x-0 bottom-0 z-10 flex min-h-[45dvh] flex-col overflow-hidden rounded-t-[24px] border-x-0 border-t border-white/10 bg-[rgba(11,14,20,0.96)] shadow-[0_-12px_28px_-24px_rgba(0,0,0,0.72)] sm:static sm:mt-4 sm:block sm:h-auto sm:min-h-0 sm:overflow-visible sm:border sm:px-4 sm:py-4 sm:shadow-none lg:mt-0 lg:rounded-[28px] lg:px-4 lg:pb-4 lg:pt-4`}
            style={
              isMobileViewport
                ? {
                    height: mobileCanvasHeight > 0 ? `${mobileCanvasHeight * 0.72}px` : "72%",
                    ...(mobileCanvasHeight > 0 && {
                      transform: `translateY(${mobileSheetTranslate}px)`,
                      transition:
                        mobileDragTranslate === null
                          ? "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)"
                          : "none",
                    }),
                  }
                : undefined
            }
          >
            <div
              role="presentation"
              onPointerDown={handleMobileSheetPointerDown}
              className="touch-none flex min-h-[44px] shrink-0 cursor-grab touch-manipulation items-center justify-center px-4 pt-4 pb-1 active:cursor-grabbing sm:hidden"
              style={{ WebkitTouchCallout: "none" }}
            >
              <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-white/12" aria-hidden />
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 sm:block sm:px-0 sm:pb-0">
              <div
                className="relative z-20 mb-3 flex items-center justify-between gap-3 sm:mb-5"
                ref={regionMenuRef}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="min-w-0 text-[15px] font-semibold tracking-[-0.02em] text-zinc-200 sm:text-lg lg:text-[1.1rem]">
                    공연장 목록 ({filteredPlaces.length}곳)
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowRegionMenu((current) => !current)}
                    className={`inline-flex min-w-0 items-center gap-1.5 border border-white/12 bg-[rgba(13,16,23,0.95)] px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors duration-200 hover:border-white/24 hover:bg-[rgba(18,23,31,0.98)] sm:px-3 sm:py-2 sm:text-xs ${RADIUS_CONTROL}`}
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
                  placement="bottom"
                >
                  <Link
                    href="/venues/new"
                    className={`${BUTTON_PRIMARY} shrink-0 px-2.5 py-1.5 text-[11px] sm:px-3 sm:py-2 sm:text-xs lg:px-3.5`}
                  >
                    + 공연장 추가
                  </Link>
                </OneTimeCoachBubble>

                {showRegionMenu && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[min(320px,calc(100vw-72px))] rounded-[18px] border border-white/12 bg-[rgba(11,14,20,0.98)] p-2.5 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.78)] backdrop-blur sm:w-[360px] sm:rounded-[20px] sm:p-3">
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {regions.map((region) => (
                        <button
                          key={region}
                          type="button"
                          onClick={() => handleRegionSelect(region)}
                          className={`${RADIUS_CONTROL} px-2.5 py-2 text-[11px] font-medium transition sm:px-3 sm:py-2.5 sm:text-xs ${
                            selectedRegion === region
                              ? "bg-primary-400 text-zinc-950"
                              : "bg-[rgba(43,48,60,0.52)] text-zinc-200 hover:bg-[rgba(58,64,80,0.78)]"
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative z-10 -mx-1 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 pt-1 pb-[max(7rem,calc(5rem+env(safe-area-inset-bottom,0px)))] sm:mx-0 sm:max-h-[52dvh] sm:px-0 sm:pb-6 lg:max-h-[calc(100dvh-340px)] lg:pr-2 lg:pb-8">
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
