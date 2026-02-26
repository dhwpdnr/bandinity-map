/**
 * 공연장(venue) 데이터 구조 정의
 * 여기서 필드 추가/삭제/수정 후, 아래 "연결된 파일"도 같이 수정해야 합니다.
 *
 * 연결된 파일:
 * - src/lib/firebase.js (addVenue, updateVenue)
 * - src/components/VenueFormModal.js (폼 입력란)
 * - src/app/page.js (상세/카드 표시)
 */

// 컬렉션 이름 (Firestore에 저장되는 테이블 이름)
export const VENUES_COLLECTION = 'venues';

// 필수 필드 (새 공연장 추가 시 반드시 입력)
export const REQUIRED_FIELDS = ['name', 'location'];

// 필드 정의: 키 → { label, type, placeholder, optional }
// type: 'string' | 'number' | 'array' | 'textarea'
export const VENUE_FIELDS = {
  name: {
    label: '공연장 이름',
    type: 'string',
    placeholder: '예: 롤링홀',
    optional: false,
  },
  location: {
    label: '주소',
    type: 'string',
    placeholder: '예: 서울시 마포구 서교동 123-45',
    optional: false,
  },
  naverMapUrl: {
    label: '네이버 지도 링크',
    type: 'string',
    placeholder: 'https://naver.me/... 또는 map.naver.com 링크',
    optional: true,
    hint: '공유 링크를 붙여넣으면 길찾기에 사용됩니다. 주소 입력 후 "주소로 좌표 찾기"를 누르면 지도에 마커가 표시됩니다.',
  },
  images: {
    label: '사진 URL',
    type: 'array',
    placeholder: '한 줄에 하나씩 이미지 URL (여러 장 가능)',
    optional: true,
    hint: '이용해 보신 분들이 올린 공연장 사진을 추가해 주세요.',
  },
  // lat, lng는 주소로 좌표 찾기로만 설정 (유저 직접 입력 없음)
  capacity: {
    label: '수용 인원',
    type: 'number',
    placeholder: '250',
    optional: true,
  },
  type: {
    label: '유형',
    type: 'string',
    placeholder: '예: 라이브 클럽, 소극장',
    optional: true,
  },
  equipment: {
    label: '장비 현황',
    type: 'array',
    placeholder: '한 줄에 하나씩 입력',
    optional: true,
    hint: '드럼 세트, 마샬 풀스택 등',
  },
  overview: {
    label: '개요',
    type: 'textarea',
    placeholder: '공연장에 대한 간단한 소개',
    optional: true,
  },
  tips: {
    label: '방문자 팁',
    type: 'textarea',
    placeholder: '대기실이 좁다, 주차 팁 등',
    optional: true,
  },
};

// Firestore에 자동으로 넣는 필드 (폼에서는 안 씀)
export const SYSTEM_FIELDS = ['updatedAt'];
