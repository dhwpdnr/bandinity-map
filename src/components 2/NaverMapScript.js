'use client';

import Script from 'next/script';

const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '';

export default function NaverMapScript() {
  if (!CLIENT_ID) return null;
  return (
    <Script
      strategy="afterInteractive"
      src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${CLIENT_ID}&submodules=geocoder`}
    />
  );
}
