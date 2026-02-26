'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = { lat: 37.5501, lng: 126.9213 }; // 홍대
const DEFAULT_ZOOM = 14;
const HAS_CLIENT_ID = typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

export default function MapComponent({ venues, selectedVenue, onSelectVenue }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isReady, setIsReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  // 네이버 지도 API 로드 대기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!HAS_CLIENT_ID) {
      setLoadFailed(true);
      return;
    }
    if (window.naver?.maps) {
      setIsReady(true);
      return;
    }
    const timeout = setTimeout(() => setLoadFailed(true), 8000);
    const check = setInterval(() => {
      if (window.naver?.maps) {
        setLoadFailed(false);
        setIsReady(true);
        clearInterval(check);
      }
    }, 100);
    return () => {
      clearInterval(check);
      clearTimeout(timeout);
    };
  }, []);

  // 지도 생성
  useEffect(() => {
    if (!isReady || !mapRef.current || !window.naver?.maps) return;
    const naver = window.naver;
    const center = new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    const map = new naver.maps.Map(mapRef.current, {
      center,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
      mapDataControl: false,
      scaleControl: false,
    });
    mapInstanceRef.current = map;
    return () => {
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [isReady]);

  // 선택된 공연장으로 지도 이동
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || selectedVenue?.lat == null || selectedVenue?.lng == null) return;
    const lat = selectedVenue.lat;
    const lng = selectedVenue.lng;
    map.setCenter(new window.naver.maps.LatLng(lat, lng));
    map.setZoom(16, true);
  }, [selectedVenue, isReady]);

  // 마커 갱신
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isReady || !map || !window.naver?.maps) return;
    const naver = window.naver;
    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    // 새 마커 생성
    const list = (venues || []).filter((v) => v.lat != null && v.lng != null);
    list.forEach((venue) => {
      const pos = new naver.maps.LatLng(venue.lat, venue.lng);
      const isSelected = selectedVenue?.id === venue.id;
      const marker = new naver.maps.Marker({
        position: pos,
        map,
        icon: {
          content: `<div style="position:relative;width:40px;height:40px;display:flex;justify-content:center;align-items:center;"><div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${isSelected ? '#8B5CF6' : '#14F1D9'};position:absolute;transform:rotate(-45deg);left:50%;top:50%;margin:-14px 0 0 -14px;border:2px solid #fff;box-shadow:0 0 12px rgba(20,241,217,0.5);"></div><span style="position:relative;z-index:1;font-size:14px;">🎵</span></div>`,
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 40),
        },
      });
      naver.maps.Event.addListener(marker, 'click', () => onSelectVenue?.(venue));
      markersRef.current.push(marker);
    });
  }, [isReady, venues, selectedVenue, onSelectVenue]);

  if (loadFailed) {
    return (
      <div className="map-container map-loading" style={{ background: 'var(--bg-dark)', flexDirection: 'column', gap: '0.5rem', padding: '1rem', textAlign: 'center' }}>
        <span>네이버 지도를 불러올 수 없습니다.</span>
        {!HAS_CLIENT_ID && (
          <span style={{ fontSize: '0.8rem' }}>.env에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 설정해 주세요.</span>
        )}
      </div>
    );
  }
  if (!isReady) {
    return <div className="map-container map-loading" style={{ background: 'var(--bg-dark)' }} />;
  }

  return <div ref={mapRef} className="map-container naver-map-container" />;
}
