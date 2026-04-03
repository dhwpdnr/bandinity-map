'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { CustomOverlayMap, Map, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { publicEnv } from '@/lib/public-env';
import type { Place } from '@/types/place';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 8;

function makePin(fill: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">`,
      `<filter id="shadow" x="-30%" y="-10%" width="160%" height="160%">`,
      `<feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(15,23,42,0.28)"/>`,
      `</filter>`,
      `<g filter="url(#shadow)">`,
      `<path fill="${fill}" d="M16 2C9.373 2 4 7.373 4 14c0 8.272 12 24 12 24s12-15.728 12-24C28 7.373 22.627 2 16 2z"/>`,
      `<circle cx="16" cy="14" r="5.5" fill="white"/>`,
      `</g>`,
      `</svg>`,
    ].join('')
  )}`;
}

function getPopupMetrics() {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
  if (viewportWidth < 380 || viewportHeight < 700) {
    return { width: 130, height: 52, gap: 6, margin: 8, compact: true };
  }
  if (viewportWidth < 640) {
    return { width: 146, height: 58, gap: 8, margin: 10, compact: false };
  }
  if (viewportWidth < 1024) {
    return { width: 220, height: 78, gap: 10, margin: 14, compact: false };
  }
  return { width: 240, height: 82, gap: 10, margin: 14, compact: false };
}

const SERVER_SAFE_POPUP_METRICS = { width: 240, height: 82, gap: 10, margin: 14, compact: false };

function PopupContent({
  place,
  offsetX,
  offsetY,
  popupRef,
  metrics,
}: {
  place: Place;
  offsetX: number;
  offsetY: number;
  popupRef: RefObject<HTMLDivElement | null>;
  metrics: { width: number; height: number; gap: number; margin: number; compact: boolean };
}) {
  return (
    <div
      className='will-change-transform'
      style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
    >
      <div
        ref={popupRef}
        style={{ width: metrics.width }}
        className='rounded-[10px] border border-white/12 bg-[rgba(11,14,20,0.96)] px-2 py-1.25 text-white shadow-[0_10px_24px_-20px_rgba(0,0,0,0.8)] backdrop-blur sm:rounded-[20px] sm:px-3 sm:py-2 sm:shadow-[0_12px_28px_-22px_rgba(0,0,0,0.82)]'
      >
        <p className={`truncate font-semibold leading-tight ${metrics.compact ? 'text-[11px]' : 'text-[12px] sm:text-[15px] lg:text-base'}`}>{place.name}</p>
        <Link href={`/places/${place.id}`} className={`mt-0.5 inline-flex items-center gap-1 font-medium text-primary-400 transition hover:text-primary-300 ${metrics.compact ? 'text-[9px]' : 'text-[10px] sm:text-[12px] lg:text-sm'}`}>
          상세정보 보러가기
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

const MARKER_SIZE = { width: 32, height: 42 };
const MARKER_OFFSET = { x: 16, y: 39 };
const DEFAULT_PIN = makePin('#171717');
const SELECTED_PIN = makePin('#64c5da');

function getDesiredMarkerScreenY() {
  const { height, gap, margin } = getPopupMetrics();
  return margin + height + gap + MARKER_OFFSET.y;
}

function getOverlayAwareVerticalOffset(mapHeight: number) {
  return Math.max(0, Math.round(mapHeight / 2 - getDesiredMarkerScreenY()));
}

function getPopupOffsets(
  map: kakao.maps.Map,
  container: HTMLDivElement,
  place: Place,
  popupElement?: HTMLDivElement | null
) {
  const projection = map.getProjection();
  const point = projection.containerPointFromCoords(
    new window.kakao.maps.LatLng(place.lat, place.lng)
  );
  const baseMetrics = getPopupMetrics();
  const width = popupElement?.offsetWidth ?? baseMetrics.width;
  const height = popupElement?.offsetHeight ?? baseMetrics.height;
  const { gap, margin } = baseMetrics;
  const maxLeft = Math.max(margin, container.clientWidth - margin - width);
  const maxTop = Math.max(margin, container.clientHeight - margin - height);
  const markerTop = point.y - MARKER_OFFSET.y;
  const markerBottom = point.y + (MARKER_SIZE.height - MARKER_OFFSET.y);
  const topAbove = markerTop - height - gap;
  const topBelow = markerBottom + gap;
  const left = Math.min(
    maxLeft,
    Math.max(margin, point.x - width / 2)
  );
  const top =
    topAbove >= margin || topBelow > maxTop
      ? Math.min(maxTop, Math.max(margin, topAbove))
      : Math.min(maxTop, Math.max(margin, topBelow));

  return {
    offsetX: Math.round(left - point.x),
    offsetY: Math.round(top - point.y),
  };
}

interface PlaceMapProps {
  places: Place[];
  fitPlaces?: Place[];
  selectedId?: string | null;
  onSelectPlace?: (place: Place | null) => void;
  selectedFocusOffset?: 'list' | 'centered';
  showSelectedOverlay?: boolean;
  resultsFocusOffset?: 'centered' | 'upper';
  resultsFitToken?: string;
}

export function PlaceMap({ places, fitPlaces, selectedId, onSelectPlace, selectedFocusOffset = 'list', showSelectedOverlay = true, resultsFocusOffset = 'centered', resultsFitToken = 'default' }: PlaceMapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: publicEnv.kakaoAppKey,
    libraries: ['services', 'clusterer'],
  });
  const [viewport, setViewport] = useState({
    center: DEFAULT_CENTER,
    level: DEFAULT_LEVEL,
  });
  const [popupOffsets, setPopupOffsets] = useState({ offsetX: -73, offsetY: -70 });
  const [popupMetrics, setPopupMetrics] = useState(SERVER_SAFE_POPUP_METRICS);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const selectedPlace = places.find((place) => place.id === selectedId) ?? null;
  const clusteredPlaces = selectedPlace
    ? places.filter((place) => place.id !== selectedPlace.id)
    : places;
  const viewportPlaces = fitPlaces ?? places;

  useEffect(() => {
    const sync = () => queueMicrotask(() => setPopupMetrics(getPopupMetrics()));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (!selectedPlace || !mapRef.current || typeof window === 'undefined') {
      return;
    }

    const map = mapRef.current;
    const target = new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
    const container = containerRef.current;

    map.setLevel(4);
    map.setCenter(target);

    window.requestAnimationFrame(() => {
      if (selectedFocusOffset !== 'centered' && container) {
        const projection = map.getProjection();
        const centerPoint = new window.kakao.maps.Point(
          Math.round(container.clientWidth / 2),
          Math.round(container.clientHeight / 2)
        );
        const desiredMarkerY = getDesiredMarkerScreenY();
        const mirroredPoint = new window.kakao.maps.Point(
          centerPoint.x,
          Math.round(centerPoint.y * 2 - desiredMarkerY)
        );
        const nextCenter = projection.coordsFromContainerPoint(mirroredPoint);
        map.setCenter(nextCenter);
      }

      window.setTimeout(() => {
        const center = map.getCenter();
        setViewport({
          center: { lat: center.getLat(), lng: center.getLng() },
          level: map.getLevel(),
        });

        if (containerRef.current) {
          setPopupOffsets(
            getPopupOffsets(map, containerRef.current, selectedPlace, popupRef.current)
          );
        }
      }, 260);
    });
  }, [selectedFocusOffset, selectedPlace]);

  useEffect(() => {
    if (selectedPlace || !mapRef.current || typeof window === 'undefined') {
      return;
    }

    const map = mapRef.current;
    const resultsVerticalOffset =
      resultsFocusOffset !== 'upper'
        ? 0
        : getOverlayAwareVerticalOffset(
            containerRef.current?.clientHeight ?? (window.innerWidth < 640 ? 420 : 520)
          );
    const syncViewport = () => {
      window.requestAnimationFrame(() => {
        const center = map.getCenter();
        setViewport({
          center: { lat: center.getLat(), lng: center.getLng() },
          level: map.getLevel(),
        });
      });
    };

    if (viewportPlaces.length === 0) {
      const fallback = new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      map.setCenter(fallback);
      map.setLevel(DEFAULT_LEVEL);
      syncViewport();
      return;
    }

    if (viewportPlaces.length === 1) {
      const target = new window.kakao.maps.LatLng(viewportPlaces[0].lat, viewportPlaces[0].lng);
      map.setCenter(target);
      map.setLevel(5);
      window.requestAnimationFrame(() => {
        if (resultsVerticalOffset !== 0) {
          map.panBy(0, resultsVerticalOffset);
        }
        window.setTimeout(syncViewport, 180);
      });
      return;
    }

    const bounds = new window.kakao.maps.LatLngBounds();

    viewportPlaces.forEach((place) => {
      bounds.extend(new window.kakao.maps.LatLng(place.lat, place.lng));
    });

    map.setBounds(bounds, 56, 56, 56, 56);
    window.requestAnimationFrame(() => {
      if (resultsVerticalOffset !== 0) {
        map.panBy(0, resultsVerticalOffset);
      }
      window.setTimeout(syncViewport, 180);
    });
  }, [resultsFitToken, resultsFocusOffset, selectedPlace, viewportPlaces]);

  useEffect(() => {
    if (
      !selectedPlace ||
      !mapRef.current ||
      !containerRef.current ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setPopupOffsets(
        getPopupOffsets(
          mapRef.current!,
          containerRef.current!,
          selectedPlace,
          popupRef.current
        )
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedPlace, viewport.center.lat, viewport.center.lng, viewport.level]);

  if (!publicEnv.kakaoAppKey) {
    return (
      <div className='flex h-full min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-[rgba(9,12,18,0.88)] p-6 text-center text-sm text-zinc-300'>
        카카오 지도 키가 설정되지 않았습니다. `NEXT_PUBLIC_KAKAO_APP_KEY`를 추가해 주세요.
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '지도를 불러오지 못했습니다. 카카오 지도 설정을 확인해 주세요.';

    return (
      <div className='flex h-full min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-[rgba(9,12,18,0.88)] p-6 text-center text-sm text-zinc-300'>
        {errorMessage}
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex h-full min-h-[320px] items-center justify-center rounded-[28px] border border-white/12 bg-[rgba(11,14,20,0.92)]'>
        <div className='flex items-center gap-3 text-sm text-zinc-300'>
          <Image src='/globe.svg' alt='' width={18} height={18} />
          지도 로딩 중...
        </div>
      </div>
    );
  }

  const center = selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : viewport.center;
  const level = selectedPlace ? 4 : viewport.level;

  return (
    <div ref={containerRef} className='relative h-full min-h-[240px] overflow-hidden rounded-[20px] border border-white/10 bg-[var(--surface-map)] p-1.5 shadow-[0_14px_36px_-28px_rgba(0,0,0,0.76)] sm:min-h-[320px] sm:rounded-[28px] sm:p-3'>
      <Map
        center={center}
        level={level}
        className='h-full w-full overflow-hidden rounded-[16px] sm:rounded-[24px]'
        isPanto
        onCreate={(map) => {
          mapRef.current = map;
        }}
        onClick={() => onSelectPlace?.(null)}
        onZoomChanged={(map) => {
          const target = map.getCenter();
          setViewport({
            center: { lat: target.getLat(), lng: target.getLng() },
            level: map.getLevel(),
          });
        }}
        onDragEnd={(map) => {
          const target = map.getCenter();
          setViewport({
            center: { lat: target.getLat(), lng: target.getLng() },
            level: map.getLevel(),
          });
        }}
      >
        <MarkerClusterer
          averageCenter
          minLevel={6}
          gridSize={58}
          texts={(count) => `${count}곳`}
          styles={[
            {
              width: '48px',
              height: '48px',
              background: 'rgba(15, 23, 42, 0.92)',
              borderRadius: '999px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              lineHeight: '48px',
              textAlign: 'center',
              boxShadow: '0 8px 18px rgba(2,6,12,0.35)',
            },
          ]}
        >
          {clusteredPlaces.map((place) => {
            const isSelected = selectedId === place.id;

            return (
              <MapMarker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                title={place.name}
                clickable
                zIndex={isSelected ? 4000 : 1}
                image={{
                  src: isSelected ? SELECTED_PIN : DEFAULT_PIN,
                  size: MARKER_SIZE,
                  options: { offset: MARKER_OFFSET },
                }}
                onClick={() => onSelectPlace?.(place)}
              />
            );
          })}
        </MarkerClusterer>

        {selectedPlace && (
          <MapMarker
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            title={selectedPlace.name}
            clickable
            zIndex={4500}
            image={{
              src: SELECTED_PIN,
              size: MARKER_SIZE,
              options: { offset: MARKER_OFFSET },
            }}
            onClick={() => onSelectPlace?.(selectedPlace)}
          />
        )}

        {selectedPlace && showSelectedOverlay && (
          <CustomOverlayMap position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} xAnchor={0} yAnchor={0} zIndex={5000} clickable>
            <PopupContent
              place={selectedPlace}
              offsetX={popupOffsets.offsetX}
              offsetY={popupOffsets.offsetY}
              popupRef={popupRef}
              metrics={popupMetrics}
            />
          </CustomOverlayMap>
        )}
      </Map>
    </div>
  );
}
