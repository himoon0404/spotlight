// ─── Region (Korea map) ───────────────────────────────────────────────────────

export interface Region {
  id: string;
  name: string;
  x: number;   // SVG x inside viewBox "0 0 100 130"
  y: number;   // SVG y inside viewBox "0 0 100 130"
  showCount: number;
  isHot?: boolean;
}

/**
 * Simplified Korean-peninsula outline.
 * viewBox "0 0 100 130" — Jeju island sits at y ≈ 106-115.
 *
 * FUTURE MAP INTEGRATION:
 *   Replace this path + the <circle> markers with a real map SDK:
 *   • Kakao Map  → npm install react-kakao-maps-sdk  → <Map center={{ lat:36.5, lng:127.8 }}>
 *   • Naver Map  → load naver maps script in layout.tsx → <NaverMap defaultCenter={...}>
 *   Coordinate conversion (approximate):
 *     lng ≈ 126.0 + (x / 100) * 3.6
 *     lat ≈ 38.5 - (y / 130) * 5.0
 */
export const KOREA_SVG_PATH =
  "M 20,8 C 30,5 55,4 76,6 C 84,10 85,22 83,32 C 82,42 80,52 77,60 C 73,70 68,78 62,83 C 55,87 48,88 40,84 C 32,80 24,72 18,62 C 12,52 12,42 14,32 C 14,22 15,14 20,8 Z";

export const JEJU_SVG_PATH =
  "M 40,106 C 42,103 50,103 53,106 C 55,110 53,114 49,115 C 45,115 40,112 40,106 Z";

export const REGIONS: Region[] = [
  { id: "seoul",    name: "서울", x: 52, y: 28,  showCount: 124, isHot: true },
  { id: "gyeonggi", name: "경기", x: 43, y: 36,  showCount:  48 },
  { id: "daejeon",  name: "대전", x: 47, y: 52,  showCount:  22 },
  { id: "daegu",    name: "대구", x: 62, y: 59,  showCount:  18 },
  { id: "gwangju",  name: "광주", x: 34, y: 66,  showCount:  15 },
  { id: "busan",    name: "부산", x: 65, y: 71,  showCount:  32, isHot: true },
  { id: "jeju",     name: "제주", x: 46, y: 110, showCount:   8 },
];

// ─── Venue (Seoul street-map, kept for VenueMap.tsx) ─────────────────────────

export interface Venue {
  id: string;
  name: string;
  shortName: string;
  area: string;
  x: number;
  y: number;
  showCount: number;
  hasLastChance: boolean;
  lastChanceTitle?: string;
  lastChanceDday?: number;
}

export const MOCK_VENUES: Venue[] = [
  { id: "v1", name: "블루스퀘어 신한카드홀",    shortName: "블루스퀘어",   area: "한남동",  x: 66, y: 48, showCount: 4, hasLastChance: false },
  { id: "v2", name: "충무아트센터 대극장",        shortName: "충무아트센터", area: "중구",    x: 52, y: 38, showCount: 3, hasLastChance: false },
  { id: "v3", name: "예술의전당 CJ토월극장",      shortName: "예술의전당",   area: "서초",    x: 42, y: 72, showCount: 5, hasLastChance: true,  lastChanceTitle: "봄의 제전",      lastChanceDday: 2 },
  { id: "v4", name: "성수동 언더스테이지",        shortName: "언더스테이지", area: "성수동",  x: 74, y: 36, showCount: 2, hasLastChance: true,  lastChanceTitle: "어둠 속의 대화", lastChanceDday: 3 },
  { id: "v5", name: "클럽 에반스",               shortName: "클럽 에반스",  area: "홍대",    x: 26, y: 42, showCount: 2, hasLastChance: true,  lastChanceTitle: "재즈 인 더 레인", lastChanceDday: 1 },
  { id: "v6", name: "LG아트센터 U+ Stage",       shortName: "LG아트센터",   area: "강서",    x: 18, y: 55, showCount: 3, hasLastChance: false },
  { id: "v7", name: "세종문화회관 대극장",        shortName: "세종문화회관", area: "광화문",  x: 48, y: 30, showCount: 6, hasLastChance: false },
  { id: "v8", name: "국립극장 해오름극장",        shortName: "국립극장",     area: "남산",    x: 54, y: 52, showCount: 4, hasLastChance: false },
  { id: "v9", name: "대학로 아르코예술극장",      shortName: "아르코극장",   area: "대학로",  x: 60, y: 24, showCount: 7, hasLastChance: true,  lastChanceTitle: "우리 읍내",      lastChanceDday: 5 },
];

export const NEARBY_VENUE_IDS = ["v4", "v1", "v8"];

// ─── SearchShow ───────────────────────────────────────────────────────────────

export interface SearchShow {
  id: string;
  venueId: string;
  title: string;
  titleSub?: string;
  venue: string;
  region: string;
  area: string;
  genre: string;
  subGenre: string;
  period: string;
  dday?: number;
  ddayLabel?: string;
  isCritical?: boolean;
  isLastChance?: boolean;
  theme: string;
  copy?: string;
  recommendTag?: string;
  viewers?: string;
  metaLevel?: string;
  isCuratorPick?: boolean;
  isHidden: boolean;
  hasEvent: boolean;
  price: number;
  reviewCount: number;
  recommendationReason?: string;
  metaText?: string;
  poster?: string;
  posterUrl?: string;
  saveCount?: number;
}

export const MOCK_SEARCH_SHOWS: SearchShow[] = [
  // ── 뮤지컬 ─ 서울 ────────────────────────────────────────────────────────────
  {
    id: "s1", venueId: "v1", region: "서울",
    title: "레베카", venue: "블루스퀘어 신한카드홀", area: "한남동",
    genre: "뮤지컬", subGenre: "라이선스 뮤지컬",
    period: "2026.04.01 – 2026.06.15", theme: "amber",
    viewers: "1,204명 관람", reviewCount: 234, price: 150000,
    isHidden: false, hasEvent: false,
    recommendationReason: "흥행 보장된 클래식 라이선스",
  },
  {
    id: "s2", venueId: "v2", region: "서울",
    title: "광화문 연가", venue: "충무아트센터 대극장", area: "중구",
    genre: "뮤지컬", subGenre: "창작 뮤지컬",
    period: "2026.04.20 – 2026.06.01", theme: "amber",
    isCuratorPick: true, reviewCount: 178, price: 110000,
    isHidden: false, hasEvent: false,
    recommendationReason: "이문세 명곡으로 엮은 감성 창작극",
  },
  {
    id: "s3", venueId: "v7", region: "서울",
    title: "어린왕자", venue: "세종문화회관 대극장", area: "광화문",
    genre: "뮤지컬", subGenre: "가족 뮤지컬",
    period: "2026.05.01 – 2026.05.31", theme: "amber",
    metaLevel: "Lv.8 유저 추천", reviewCount: 89, price: 60000,
    isHidden: false, hasEvent: true,
    metaText: "온 가족이 함께 보기 좋아요",
  },
  // ── 연극 ─ 서울 ──────────────────────────────────────────────────────────────
  {
    id: "s4", venueId: "v4", region: "서울",
    title: "어둠 속의 대화", titleSub: "시즌 파이널",
    venue: "성수동 언더스테이지", area: "성수동",
    genre: "연극", subGenre: "실험극",
    period: "2026.04.30 – 2026.05.04", dday: 3, ddayLabel: "D-3",
    isLastChance: true, theme: "red",
    copy: "이번 주 마지막 공연", metaLevel: "Lv.14 유저 추천",
    viewers: "47명이 관람", reviewCount: 23, price: 30000,
    isHidden: true, hasEvent: false,
    recommendationReason: "완전한 어둠 속 오감 체험 몰입극",
  },
  {
    id: "s5", venueId: "v9", region: "서울",
    title: "우리 읍내", titleSub: "Our Town",
    venue: "아르코예술극장 소극장", area: "대학로",
    genre: "연극", subGenre: "대학로 연극",
    period: "2026.04.22 – 2026.05.07", dday: 5, ddayLabel: "D-5",
    theme: "red", copy: "연장 없이 폐막",
    recommendTag: "★ 4.9", viewers: "23명이 관람",
    reviewCount: 12, price: 35000,
    isHidden: false, hasEvent: false,
  },
  {
    id: "s6", venueId: "v9", region: "서울",
    title: "봄봄", venue: "아르코예술극장 소극장", area: "대학로",
    genre: "연극", subGenre: "코미디",
    period: "2026.05.02 – 2026.05.25", theme: "red",
    viewers: "38명이 관람", reviewCount: 45, price: 28000,
    isHidden: false, hasEvent: false,
  },
  {
    id: "s7", venueId: "v8", region: "서울",
    title: "침묵의 독백", venue: "국립극장 달오름극장", area: "남산",
    genre: "연극", subGenre: "독립극",
    period: "2026.05.05 – 2026.05.18", theme: "red",
    isCuratorPick: true, reviewCount: 8, price: 20000,
    isHidden: true, hasEvent: false,
    recommendationReason: "국립극단 신진 연출가 주목작",
  },
  // ── 재즈 ─ 서울 ──────────────────────────────────────────────────────────────
  {
    id: "s8", venueId: "v5", region: "서울",
    title: "재즈 인 더 레인", titleSub: "Chet Baker 헌정 나이트",
    venue: "클럽 에반스", area: "홍대",
    genre: "재즈", subGenre: "재즈 라이브",
    period: "2026.05.03 단 하루", dday: 1, ddayLabel: "D-1",
    isCritical: true, isLastChance: true, theme: "teal",
    copy: "지금 아니면 끝", isCuratorPick: true,
    viewers: "잔여 12석", reviewCount: 8, price: 25000,
    isHidden: true, hasEvent: false,
    recommendationReason: "한국 최정상 재즈 트리오 단 하루",
  },
  {
    id: "s9", venueId: "v5", region: "서울",
    title: "봄밤의 재즈", venue: "클럽 에반스", area: "홍대",
    genre: "재즈", subGenre: "보컬 재즈",
    period: "2026.05.10 – 2026.05.12", dday: 8, ddayLabel: "D-8",
    theme: "teal", reviewCount: 15, price: 20000,
    isHidden: true, hasEvent: false,
  },
  {
    id: "s10", venueId: "v5", region: "서울",
    title: "퓨전 재즈 나이트", venue: "클럽 에반스", area: "홍대",
    genre: "재즈", subGenre: "퓨전 재즈",
    period: "2026.05.17", dday: 15, ddayLabel: "D-15",
    theme: "teal", reviewCount: 5, price: 18000,
    isHidden: true, hasEvent: false,
  },
  // ── 클래식 ─ 서울 ────────────────────────────────────────────────────────────
  {
    id: "s11", venueId: "v7", region: "서울",
    title: "봄 챔버 콘서트", venue: "세종문화회관 체임버홀", area: "광화문",
    genre: "클래식", subGenre: "실내악",
    period: "2026.05.08 – 2026.05.10", dday: 6, ddayLabel: "D-6",
    theme: "blue", reviewCount: 31, price: 40000,
    isHidden: false, hasEvent: false,
  },
  {
    id: "s12", venueId: "v3", region: "서울",
    title: "피아노 포 원", titleSub: "무대 위의 독백",
    venue: "예술의전당 IBK챔버홀", area: "서초",
    genre: "클래식", subGenre: "피아노 리사이틀",
    period: "2026.05.15 – 2026.05.20", theme: "blue",
    isCuratorPick: true, reviewCount: 19, price: 55000,
    isHidden: true, hasEvent: false,
    recommendationReason: "2025 쇼팽 콩쿠르 입상자 국내 첫 무대",
  },
  // ── 인디음악 ─ 서울 ──────────────────────────────────────────────────────────
  {
    id: "s13", venueId: "v5", region: "서울",
    title: "새벽 3시의 노래", venue: "홍대 벨로드롬", area: "홍대",
    genre: "인디음악", subGenre: "싱어송라이터",
    period: "2026.05.14", dday: 12, ddayLabel: "D-12",
    theme: "purple", viewers: "65명이 관람",
    reviewCount: 28, price: 22000,
    isHidden: true, hasEvent: true,
    recommendationReason: "유일하게 음악만 남기는 정직한 무대",
  },
  {
    id: "s14", venueId: "v4", region: "서울",
    title: "지하 소극장 밴드 페스티벌", venue: "성수동 언더스테이지", area: "성수동",
    genre: "인디음악", subGenre: "밴드",
    period: "2026.05.16 – 2026.05.18", theme: "purple",
    metaLevel: "Lv.11 유저 추천", reviewCount: 42, price: 30000,
    isHidden: false, hasEvent: false,
  },
  // ── 무용 ─ 서울 ──────────────────────────────────────────────────────────────
  {
    id: "s15", venueId: "v6", region: "서울",
    title: "소수의 춤", titleSub: "이도현 안무가 첫 솔로",
    venue: "LG아트센터 U+ Stage", area: "강서",
    genre: "무용", subGenre: "현대무용",
    period: "2026.05.01 – 2026.05.31", theme: "purple",
    isCuratorPick: true, viewers: "관람 31명",
    reviewCount: 14, price: 45000,
    isHidden: true, hasEvent: false,
    recommendationReason: "몸의 언어로 쓴 소수자 이야기",
  },
  {
    id: "s16", venueId: "v3", region: "서울",
    title: "봄의 제전", titleSub: "스트라빈스키",
    venue: "예술의전당 CJ토월극장", area: "서초",
    genre: "무용", subGenre: "발레",
    period: "2026.05.01 – 2026.05.04", dday: 2, ddayLabel: "D-2",
    isLastChance: true, theme: "purple",
    copy: "이번 주 마지막 공연",
    viewers: "127명이 관람", reviewCount: 67, price: 80000,
    isHidden: false, hasEvent: false,
  },
  // ── 전통예술 ─ 서울 ──────────────────────────────────────────────────────────
  {
    id: "s17", venueId: "v8", region: "서울",
    title: "춘향가", venue: "국립극장 해오름극장", area: "남산",
    genre: "전통예술", subGenre: "판소리",
    period: "2026.05.08 – 2026.05.12", theme: "emerald",
    viewers: "18명이 관람", reviewCount: 22, price: 35000,
    isHidden: true, hasEvent: false,
    recommendationReason: "완창 판소리의 정수, 다시 없을 기회",
  },
  {
    id: "s18", venueId: "v7", region: "서울",
    title: "사물놀이 대공연", venue: "세종문화회관 세종홀", area: "광화문",
    genre: "전통예술", subGenre: "사물놀이",
    period: "2026.05.05 – 2026.05.06", dday: 3, ddayLabel: "D-3",
    isLastChance: true, theme: "emerald",
    reviewCount: 11, price: 25000,
    isHidden: false, hasEvent: true,
  },
  // ── 부산 ─────────────────────────────────────────────────────────────────────
  {
    id: "s19", venueId: "vb1", region: "부산",
    title: "부산 창작 뮤지컬 페스티벌", venue: "부산문화회관 대극장", area: "부산진구",
    genre: "뮤지컬", subGenre: "창작 뮤지컬",
    period: "2026.05.10 – 2026.06.30", theme: "amber",
    viewers: "204명 관람", reviewCount: 45, price: 70000,
    isHidden: false, hasEvent: true,
    recommendationReason: "부산 기반 창작팀의 수작",
    metaText: "부산에서만 볼 수 있어요",
  },
  {
    id: "s20", venueId: "vb2", region: "부산",
    title: "재즈 앤 더 씨", venue: "해운대 블루라운지", area: "해운대구",
    genre: "재즈", subGenre: "재즈 라이브",
    period: "2026.05.03", dday: 1, ddayLabel: "D-1",
    isCritical: true, isLastChance: true, theme: "teal",
    copy: "오늘이 마지막", isCuratorPick: true,
    viewers: "잔여 8석", reviewCount: 12, price: 25000,
    isHidden: true, hasEvent: false,
    recommendationReason: "바다가 보이는 재즈 바 단 하루 공연",
  },
  {
    id: "s21b", venueId: "vb3", region: "부산",
    title: "남항대교 야경 클래식", venue: "영도 아트홀", area: "영도구",
    genre: "클래식", subGenre: "실내악",
    period: "2026.05.20 – 2026.05.22", theme: "blue",
    reviewCount: 18, price: 45000,
    isHidden: true, hasEvent: false,
    recommendationReason: "부산 야경과 함께하는 현악 사중주",
  },
  // ── 대구 ─────────────────────────────────────────────────────────────────────
  {
    id: "s21", venueId: "vd1", region: "대구",
    title: "대구시립극단 봄 정기공연", venue: "대구문화예술회관 비슬홀", area: "달서구",
    genre: "연극", subGenre: "대학로 연극",
    period: "2026.05.08 – 2026.05.31", theme: "red",
    viewers: "56명 관람", reviewCount: 28, price: 30000,
    isHidden: false, hasEvent: false,
    metaText: "대구 대표 극단의 신작",
  },
  {
    id: "s21c", venueId: "vd2", region: "대구",
    title: "대구 오페라 갈라 콘서트", venue: "대구오페라하우스", area: "북구",
    genre: "클래식", subGenre: "오페라",
    period: "2026.05.15 – 2026.05.16", dday: 13, ddayLabel: "D-13",
    theme: "blue", isCuratorPick: true,
    reviewCount: 41, price: 90000,
    isHidden: false, hasEvent: false,
    recommendationReason: "대구국제오페라축제 프리뷰 공연",
  },
  // ── 광주 ─────────────────────────────────────────────────────────────────────
  {
    id: "s22", venueId: "vg1", region: "광주",
    title: "국립국악원 봄 판소리 무대", venue: "국립아시아문화전당", area: "동구",
    genre: "전통예술", subGenre: "판소리",
    period: "2026.05.15 – 2026.05.18", theme: "emerald",
    isCuratorPick: true, reviewCount: 19, price: 20000,
    isHidden: true, hasEvent: false,
    recommendationReason: "아시아문화전당의 공간을 살린 특별 판소리",
  },
  {
    id: "s22b", venueId: "vg2", region: "광주",
    title: "5·18 기념 현대무용", venue: "광주문화예술회관", area: "북구",
    genre: "무용", subGenre: "현대무용",
    period: "2026.05.18", dday: 16, ddayLabel: "D-16",
    theme: "purple", viewers: "89명 관람",
    reviewCount: 33, price: 15000,
    isHidden: false, hasEvent: false,
    recommendationReason: "역사적 의미를 몸으로 말하는 무대",
  },
  // ── 대전 ─────────────────────────────────────────────────────────────────────
  {
    id: "s23", venueId: "vdj1", region: "대전",
    title: "대전시립교향악단 정기연주회", venue: "대전예술의전당 아트홀", area: "서구",
    genre: "클래식", subGenre: "교향악",
    period: "2026.05.14", dday: 12, ddayLabel: "D-12",
    theme: "blue", reviewCount: 33, price: 50000,
    isHidden: false, hasEvent: false,
    metaText: "대전 최고 오케스트라",
  },
  {
    id: "s23b", venueId: "vdj2", region: "대전",
    title: "대전 인디 쇼케이스", venue: "대전 루트 클럽", area: "중구",
    genre: "인디음악", subGenre: "밴드",
    period: "2026.05.09 – 2026.05.10", dday: 7, ddayLabel: "D-7",
    theme: "purple", viewers: "44명 관람",
    reviewCount: 16, price: 20000,
    isHidden: true, hasEvent: true,
    recommendationReason: "대전 씬을 이끄는 4팀 집결",
  },
  // ── 경기 ─────────────────────────────────────────────────────────────────────
  {
    id: "s24", venueId: "vk1", region: "경기",
    title: "수원화성 달빛 국악 공연", venue: "수원 화성행궁 광장", area: "수원시",
    genre: "전통예술", subGenre: "전통춤",
    period: "2026.05.05 – 2026.05.31", theme: "emerald",
    viewers: "82명이 관람", reviewCount: 41, price: 15000,
    isHidden: false, hasEvent: true,
    recommendationReason: "세계문화유산 화성에서 펼치는 전통 공연",
    metaText: "야외 무대, 날씨 좋을 때 추천",
  },
  {
    id: "s24b", venueId: "vk2", region: "경기",
    title: "고양 아람누리 뮤지컬 갈라", venue: "아람누리 새라새극장", area: "고양시",
    genre: "뮤지컬", subGenre: "라이선스 뮤지컬",
    period: "2026.05.17 – 2026.05.18", dday: 15, ddayLabel: "D-15",
    theme: "amber", reviewCount: 27, price: 65000,
    isHidden: false, hasEvent: false,
  },
  // ── 제주 ─────────────────────────────────────────────────────────────────────
  {
    id: "s25", venueId: "vj1", region: "제주",
    title: "제주 봄 인디 페스티벌", venue: "제주아트센터 소극장", area: "제주시",
    genre: "인디음악", subGenre: "밴드",
    period: "2026.05.20 – 2026.05.22", theme: "purple",
    isCuratorPick: true, reviewCount: 15, price: 35000,
    isHidden: false, hasEvent: true,
    recommendationReason: "제주의 자연 속 감성 인디 3일 페스티벌",
    metaText: "여행 일정에 넣어보세요",
  },
  {
    id: "s25b", venueId: "vj2", region: "제주",
    title: "해녀의 노래", venue: "제주 민속공연장", area: "서귀포시",
    genre: "전통예술", subGenre: "전통춤",
    period: "2026.05.01 – 2026.05.31", theme: "emerald",
    viewers: "34명 관람", reviewCount: 22, price: 18000,
    isHidden: true, hasEvent: false,
    recommendationReason: "제주 해녀 문화를 춤으로 풀어낸 고요한 무대",
  },
];

// ─── Genre taxonomy ───────────────────────────────────────────────────────────

export const GENRES: Record<string, { emoji: string; subGenres: string[] }> = {
  뮤지컬:   { emoji: "🎭", subGenres: ["창작 뮤지컬", "라이선스 뮤지컬", "가족 뮤지컬"] },
  연극:     { emoji: "🎪", subGenres: ["대학로 연극", "실험극", "코미디", "독립극"] },
  재즈:     { emoji: "🎷", subGenres: ["재즈 라이브", "보컬 재즈", "퓨전 재즈", "재즈 바"] },
  클래식:   { emoji: "🎻", subGenres: ["교향악", "실내악", "피아노 리사이틀", "오페라"] },
  인디음악: { emoji: "🎸", subGenres: ["밴드", "싱어송라이터", "어쿠스틱", "소극장 공연"] },
  무용:     { emoji: "💃", subGenres: ["현대무용", "발레", "전통무용", "스트리트댄스"] },
  전통예술: { emoji: "🪷", subGenres: ["판소리", "사물놀이", "전통춤", "국악"] },
};

export const EXTRA_TAGS = ["마감 임박", "숨은 공연", "리뷰 많은 공연", "가격 낮은 공연", "이벤트 있음"];
