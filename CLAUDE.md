@AGENTS.md

# Spotlight — 한국 공연 예술 탐색 플랫폼

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 프로젝트.
KOPIS(공연예술통합전산망) API로 연극·무용·음악·클래식 공연 데이터를 수집해 보여준다.

## 핵심 기능
- **온보딩**: 이름·선호 장르·지역 설정 (로컬 스토리지 유지)
- **홈 피드**: 추천 공연, 트렌딩, 마감 임박(D-day), 지역 근처 공연장, 히든 젬, 게임화 이벤트
- **검색**: 장르·공연장 필터 + 한국 지도 기반 탐색
- **지도**: 공연장·공연 위치 시각화

## 기술 규칙
- 경로 별칭: `@/*` → `src/*`
- ISR 캐싱: 30분 revalidation (`next.revalidate = 1800`)
- fetch는 AbortController로 관리
- 컴포넌트는 `src/components/`, 페이지는 `src/app/` (App Router)

## 데이터 원칙
- **mock 데이터 사용 금지**: 모든 공연 데이터는 실제 KOPIS API에서 가져온다. mock 파일(`mockData.ts`, `searchMockData.ts` 등)을 새로 만들거나 하드코딩된 샘플 데이터를 사용하지 않는다.
- 새 기능을 만들 때 데이터가 필요하면 `/api/kopis`, `/api/shows`, `/api/show-detail` 등 기존 API 라우트를 활용하거나 새 API 라우트를 추가한다.

## 주의 사항
- Next.js 16은 훈련 데이터와 API가 다를 수 있음 → `node_modules/next/dist/docs/` 먼저 확인
- KOPIS API 키는 환경변수(`NEXT_PUBLIC_KOPIS_API_KEY`)로 관리
- TypeScript strict 모드 준수
