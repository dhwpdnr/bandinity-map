/** 공연장(라이브홀 등) 타입 */
export interface Venue {
  id: string;
  name: string;
  address: string;
  /** 지도 위도 */
  lat: number;
  /** 지도 경도 */
  lng: number;
  /** 지역 (예: 서울, 경기) */
  region: string;
  /** 연락처 */
  phone?: string;
  /** 설명 */
  description?: string;
  /** 대표 이미지 URL */
  imageUrl?: string;
  /** 홈페이지/예약 링크 */
  link?: string;
  /** 태그 (합주실, 라이브홀 등) */
  tags?: string[];
  createdAt?: { seconds: number };
  updatedAt?: { seconds: number };
}
