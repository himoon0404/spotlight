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

## 주의 사항
- Next.js 16은 훈련 데이터와 API가 다를 수 있음 → `node_modules/next/dist/docs/` 먼저 확인
- KOPIS API 키는 환경변수(`NEXT_PUBLIC_KOPIS_API_KEY`)로 관리
- 댑핑 없이 TypeScript strict 모드 준수
