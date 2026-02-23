# 공연장 지도 (Bandinity Map)

지도를 메인으로 두고, 카카오 지도 위에 공연장·합주실·라이브홀을 표시합니다.

## 기능

- **지도 메인**: 카카오 지도에 공연장 마커 표시, 클릭 시 해당 위치로 이동 및 상세 링크
- **공연장 목록**: 지역 필터, 목록에서 선택 시 지도와 연동
- **공연장 상세**: 주소, 연락처, 소개, 예약 링크
- **반응형**: 모바일 우선, 웹에서도 깔끔하게 보이도록 구성

## 기술 스택

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS**
- **카카오 지도** (react-kakao-maps-sdk)
- **Firebase Firestore** (공연장 데이터)

## 시작하기

### 1. 환경 변수

`.env.local.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

- **카카오 지도**: [Kakao Developers](https://developers.kakao.com/)에서 앱 생성 후 **JavaScript 키**를 발급받아 `NEXT_PUBLIC_KAKAO_APP_KEY`에 넣습니다.
- **Firebase**: [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성 후, 프로젝트 설정 > 일반 > 앱에서 웹 앱 설정 시 나오는 `firebaseConfig` 값을 각 `NEXT_PUBLIC_FIREBASE_*` 변수에 넣습니다.

### 2. Firestore 컬렉션

Firestore에 `venues` 컬렉션을 만들고, 아래 필드로 문서를 추가합니다.

| 필드        | 타입   | 필수 | 설명                        |
| ----------- | ------ | ---- | --------------------------- |
| name        | string | O    | 공연장 이름                 |
| address     | string | O    | 주소                        |
| lat         | number | O    | 위도                        |
| lng         | number | O    | 경도                        |
| region      | string | O    | 지역 (예: 서울)             |
| phone       | string |      | 연락처                      |
| description | string |      | 소개                        |
| imageUrl    | string |      | 대표 이미지 URL             |
| link        | string |      | 예약/홈페이지 URL           |
| tags        | array  |      | 태그 (예: 합주실, 라이브홀) |

Firestore에서 **인덱스**가 필요할 수 있습니다. `venues` 컬렉션에 `name` 오름차순 정렬을 사용하므로, 첫 쿼리 시 콘솔에 나오는 인덱스 생성 링크를 통해 복합 인덱스를 만들어 주세요.

### 3. 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx      # 루트 레이아웃
│   ├── page.tsx        # 메인 (지도 + 목록)
│   └── venues/[id]/    # 공연장 상세
├── components/
│   ├── VenueMap.tsx    # 카카오 지도 + 마커
│   ├── VenueList.tsx   # 공연장 목록
│   └── VenueCard.tsx   # 공연장 카드
├── lib/
│   ├── firebase.ts     # Firebase 초기화
│   └── venues.ts       # Firestore 조회
└── types/
    └── venue.ts        # 공연장 타입
```

## 참고

- [카카오 지도 API](https://apis.map.kakao.com/web/)
- [react-kakao-maps-sdk](https://react-kakao-maps-sdk.jaeseokim.dev/)

Made by cursor
