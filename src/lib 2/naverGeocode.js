/**
 * 네이버 지도 Geocoding: 주소 → 위도/경도
 * Naver Maps 스크립트가 로드된 후에만 사용 가능.
 */
export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.naver?.maps?.Service) {
      reject(new Error('네이버 지도 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.'));
      return;
    }
    const trim = String(address || '').trim();
    if (!trim) {
      reject(new Error('주소를 입력해 주세요.'));
      return;
    }
    window.naver.maps.Service.geocode({ address: trim }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        reject(new Error('주소를 찾을 수 없습니다. 주소를 확인해 주세요.'));
        return;
      }
      const items = response?.result?.items || [];
      const found = items.find((i) => i.address && (i.point?.x != null && i.point?.y != null));
      if (!found || found.point == null) {
        reject(new Error('해당 주소의 좌표를 찾을 수 없습니다.'));
        return;
      }
      // Naver uses (x: lng, y: lat)
      resolve({ lat: found.point.y, lng: found.point.x });
    });
  });
}

/**
 * 네이버 지도 URL인지 확인 (naver.me, map.naver.com)
 */
export function isNaverMapUrl(url) {
  const u = String(url || '').trim();
  return u.startsWith('https://naver.me/') || u.startsWith('https://map.naver.com') || u.startsWith('http://map.naver.com');
}
