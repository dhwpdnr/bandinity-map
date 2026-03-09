# Bandinity

가용성 중심으로 공연장과 합주실을 탐색하는 Next.js 앱입니다. 현재 Firestore 구조는
`venues` 컬렉션과 `venues/{id}/reviews` 서브컬렉션을 기준으로 동작합니다.

## 현재 기능

- `venues` 중심 공개 탐색
  - 날짜 기준 가용성 필터
  - 지역 / 유형 / 태그 / 검증 상태 필터
  - 지도 + 리스트 분할 UI
- 장소 상세
  - 가용성 캘린더
  - 출처 / 검증 상태 / 최근 업데이트 표시
  - 공개 사진 / 리뷰 조회
- 장소 등록 / 수정
  - `/venues/new` 직접 등록
  - `/venues/[id]/edit` 직접 수정
- 리뷰 작성
  - `venues/{id}/reviews` 직접 등록

## 기술 스택

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Kakao Map
- Firebase Firestore

## 환경 변수

기본 클라이언트 설정은 [.env.local.example](/Users/jetproc/jetproc/Bandinity/web_project/bandinity-map/.env.local.example)에 정리되어 있습니다.

필수 범주:

- 공개 앱
  - `NEXT_PUBLIC_KAKAO_APP_KEY`
  - `NEXT_PUBLIC_FIREBASE_*`

## 실행

```bash
npm install
npm run dev
```

검증:

```bash
npm run lint
npm run test
npm run build
```

## 주요 경로

- `/` 공개 탐색
- `/places/[id]` 장소 상세
- `/venues/new` 장소 등록
- `/venues/[id]/edit` 장소 수정
- `/submit` 기존 링크 호환용 리다이렉트
