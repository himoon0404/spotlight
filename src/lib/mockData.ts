import type { ProcessedShow, ShowsPayload } from "@/types/show";

const popular: ProcessedShow[] = [
  {
    id: "mp1", rank: 1, theme: "teal", genre: "뮤지컬",
    title: "레베카", venue: "충무아트센터 대극장",
    period: "2026.04.01 – 2026.06.15", running: "160분",
    area: "서울특별시", viewers: "1,204명 관람",
  },
  {
    id: "mp2", rank: 2, theme: "emerald", genre: "뮤지컬",
    title: "오케피!", venue: "예술의전당 CJ토월극장",
    period: "2026.03.22 – 2026.05.31", running: "120분",
    area: "서울특별시", viewers: "876명 관람",
  },
  {
    id: "mp3", rank: 3, theme: "amber", genre: "뮤지컬",
    title: "캣츠", venue: "블루스퀘어 신한카드홀",
    period: "2026.04.18 – 2026.07.06", running: "150분",
    area: "서울특별시", viewers: "732명 관람",
  },
  {
    id: "mp4", rank: 4, theme: "red", genre: "연극",
    title: "나는 광기를 원한다", venue: "두산아트센터 SPACE111",
    period: "2026.04.10 – 2026.06.01", running: "100분",
    area: "서울특별시", viewers: "541명 관람",
  },
  {
    id: "mp5", rank: 5, theme: "blue", genre: "클래식",
    title: "정명훈 마스터클래스 리사이틀", venue: "예술의전당 콘서트홀",
    period: "2026.05.02 – 2026.05.25", running: "130분",
    area: "서울특별시", viewers: "498명 관람",
  },
  {
    id: "mp6", rank: 6, theme: "amber", genre: "뮤지컬",
    title: "맨 오브 라만차", venue: "샤롯데씨어터",
    period: "2026.04.20 – 2026.07.20", running: "140분",
    area: "서울특별시", viewers: "463명 관람",
  },
  {
    id: "mp7", rank: 7, theme: "purple", genre: "무용",
    title: "발레 라 바야데르", venue: "국립극장 해오름극장",
    period: "2026.05.09 – 2026.05.18", running: "180분",
    area: "서울특별시", viewers: "387명 관람",
  },
  {
    id: "mp8", rank: 8, theme: "red", genre: "연극",
    title: "삼일간의 비", venue: "명동예술극장",
    period: "2026.04.25 – 2026.06.08", running: "110분",
    area: "서울특별시", viewers: "312명 관람",
  },
  {
    id: "mp9", rank: 9, theme: "teal", genre: "재즈",
    title: "황제 재즈 나이트", venue: "예스24 라이브홀",
    period: "2026.05.17 – 2026.05.17", running: "120분",
    area: "서울특별시", viewers: "278명 관람",
  },
  {
    id: "mp10", rank: 10, theme: "emerald", genre: "뮤지컬",
    title: "젠틀맨스 가이드", venue: "충무아트센터 중극장 블루",
    period: "2026.05.01 – 2026.07.13", running: "150분",
    area: "서울특별시", viewers: "241명 관람",
  },
];

const lastChance: ProcessedShow[] = [
  {
    id: "mlc1", theme: "red", genre: "연극",
    title: "어둠 속의 대화", titleSub: "시즌 파이널", titleEn: "DIALOGUE IN THE DARK",
    venue: "성수동 언더스테이지", period: "2026.04.30 – 2026.05.04", running: "75분",
    area: "서울특별시", dday: 3, ddayLabel: "D-3", isCritical: false,
    copy: "이번 주 마지막 공연", badges: ["Lv.14 유저 추천", "47명이 관람"],
  },
  {
    id: "mlc2", theme: "teal", genre: "재즈",
    title: "재즈 인 더 레인", titleSub: "Chet Baker 헌정 나이트",
    venue: "클럽 에반스 · 홍대", period: "2026.05.03 단 하루", running: "110분",
    area: "서울특별시", dday: 1, ddayLabel: "D-1", isCritical: true,
    copy: "지금 아니면 끝", badges: ["큐레이터 PICK", "잔여 12석"],
  },
  {
    id: "mlc3", theme: "red", genre: "연극",
    title: "우리 읍내", titleSub: "Our Town",
    venue: "아르코예술극장 소극장", period: "2026.04.22 – 2026.05.07", running: "100분",
    area: "서울특별시", dday: 5, ddayLabel: "D-5", isCritical: false,
    copy: "연장 없이 폐막", badges: ["23명이 관람", "★ 4.9"],
  },
  {
    id: "mlc4", theme: "blue", genre: "국악",
    title: "정가 독창회", titleSub: "봄의 소리",
    venue: "국립국악원 우면당", period: "2026.05.01 – 2026.05.02", running: "90분",
    area: "서울특별시", dday: 2, ddayLabel: "D-2", isCritical: true,
    copy: "이번 주 마지막 기회", badges: ["전통 공연", "좌석 한정"],
  },
  {
    id: "mlc5", theme: "purple", genre: "현대무용",
    title: "컨템포러리 솔로", titleSub: "안무가 김하늘",
    venue: "대학로예술극장 소극장", period: "2026.04.28 – 2026.05.04", running: "60분",
    area: "서울특별시", dday: 4, ddayLabel: "D-4", isCritical: false,
    copy: "이번 주 마지막 공연", badges: ["신인 안무가", "★ 4.7"],
  },
  {
    id: "mlc6", theme: "blue", genre: "클래식",
    title: "봄날의 챔버 콘서트", titleSub: "피아노·바이올린·첼로",
    venue: "예술의전당 IBK챔버홀", period: "2026.04.30 – 2026.05.05", running: "80분",
    area: "서울특별시", dday: 5, ddayLabel: "D-5", isCritical: false,
    copy: "연장 없이 폐막", badges: ["큐레이터 PICK", "35명이 관람"],
  },
  {
    id: "mlc7", theme: "red", genre: "연극",
    title: "버스 정류장", titleSub: "고 선웅 연출",
    venue: "명동예술극장 소극장", period: "2026.04.26 – 2026.05.06", running: "95분",
    area: "서울특별시", dday: 6, ddayLabel: "D-6", isCritical: false,
    copy: "곧 막내려", badges: ["★ 4.8", "19명이 관람"],
  },
  {
    id: "mlc8", theme: "amber", genre: "뮤지컬",
    title: "살인마 잭", titleSub: "SWEENEY TODD",
    venue: "충무아트센터 중극장", period: "2026.04.24 – 2026.05.07", running: "130분",
    area: "서울특별시", dday: 7, ddayLabel: "D-7", isCritical: false,
    copy: "곧 막내려", badges: ["재연", "★ 4.6"],
  },
];

const hidden: ProcessedShow[] = [
  {
    id: "mh1", theme: "blue", genre: "현대무용",
    title: "소수의 춤", titleSub: "이도현 안무가 첫 솔로 공연",
    venue: "LG아트센터 U+ Stage", period: "2026.05.01 – 2026.05.31", running: "80분",
    area: "서울특별시", recommendReason: "신인 아티스트 주목",
    meta: "★ 4.8 · 관람 31명",
  },
  {
    id: "mh2", theme: "purple", genre: "클래식",
    title: "피아노 포 원", titleSub: "무대 위의 독백",
    venue: "세종문화회관 체임버홀", period: "2026.05.10 – 2026.05.20", running: "80분",
    area: "서울특별시", recommendReason: "평점 높고 관객 수 적은 공연",
    meta: "큐레이터 PICK",
  },
  {
    id: "mh3", theme: "emerald", genre: "인디음악",
    title: "서교동 라이브", titleSub: "홍대 인디씬 세션",
    venue: "FF · 서교동", period: "2026.05.03 – 2026.05.31", running: "100분",
    area: "서울특별시", recommendReason: "평점 대비 저평가 공연",
    meta: "★ 4.7 · 관람 18명",
  },
  {
    id: "mh4", theme: "blue", genre: "오페라",
    title: "피가로의 결혼", titleSub: "Le nozze di Figaro",
    venue: "예술의전당 오페라극장", period: "2026.05.08 – 2026.05.18", running: "200분",
    area: "서울특별시", recommendReason: "소규모 공연 · 한정 좌석",
    meta: "★ 4.9 · 관람 44명",
  },
  {
    id: "mh5", theme: "amber", genre: "전통예술",
    title: "소리, 빛의 한가운데", titleSub: "판소리 현대 재해석",
    venue: "국립극장 달오름극장", period: "2026.05.06 – 2026.05.25", running: "75분",
    area: "서울특별시", recommendReason: "전통 공연 · 비주류 명작",
    meta: "★ 4.8 · 관람 27명",
  },
  {
    id: "mh6", theme: "purple", genre: "현대무용",
    title: "공중에서 춤을", titleSub: "공중 무용 퍼포먼스",
    venue: "아르코예술극장 대극장", period: "2026.05.14 – 2026.05.23", running: "70분",
    area: "서울특별시", recommendReason: "신인 아티스트 주목",
    meta: "큐레이터 PICK · 관람 21명",
  },
  {
    id: "mh7", theme: "teal", genre: "재즈",
    title: "모달 재즈 이브닝", titleSub: "Miles Davis 트리뷰트",
    venue: "재즈클럽 올댓재즈 · 강남", period: "2026.05.09 – 2026.05.30", running: "120분",
    area: "서울특별시", recommendReason: "평점 높고 관객 수 적은 공연",
    meta: "★ 4.9 · 관람 15명",
  },
];

const nearby: ProcessedShow[] = [
  {
    id: "mn1", theme: "teal", genre: "뮤지컬",
    title: "지하철 1호선", venue: "학전블루 소극장",
    period: "2026.04.15 – 2026.06.30", running: "120분", area: "서울특별시",
  },
  {
    id: "mn2", theme: "amber", genre: "연극",
    title: "아트", venue: "대학로 아르코예술극장",
    period: "2026.05.01 – 2026.05.30", running: "90분", area: "서울특별시",
  },
  {
    id: "mn3", theme: "blue", genre: "클래식",
    title: "봄 챔버 콘서트", venue: "예술의전당 IBK챔버홀",
    period: "2026.05.08 – 2026.05.10", running: "100분", area: "서울특별시",
    dday: 6, ddayLabel: "D-6", isCritical: false,
  },
  {
    id: "mn4", theme: "purple", genre: "무용",
    title: "이것이 발레다", venue: "국립극장 해오름극장",
    period: "2026.05.15 – 2026.05.24", running: "110분", area: "서울특별시",
  },
  {
    id: "mn5", theme: "red", genre: "연극",
    title: "킬 미 나우", venue: "혜화동 1번지 소극장",
    period: "2026.05.03 – 2026.06.15", running: "85분", area: "서울특별시",
  },
  {
    id: "mn6", theme: "emerald", genre: "뮤지컬",
    title: "번지점프를 하다", venue: "드림아트센터 3관",
    period: "2026.04.19 – 2026.06.22", running: "100분", area: "서울특별시",
  },
  {
    id: "mn7", theme: "blue", genre: "클래식",
    title: "수원 심포니 정기 연주회", venue: "경기아트센터 대공연장",
    period: "2026.05.11 – 2026.05.11", running: "120분", area: "경기도",
    dday: 11, ddayLabel: "D-11",
  },
  {
    id: "mn8", theme: "amber", genre: "뮤지컬",
    title: "위키드", venue: "성남아트센터 오페라하우스",
    period: "2026.05.04 – 2026.06.29", running: "160분", area: "경기도",
  },
  {
    id: "mn9", theme: "teal", genre: "재즈",
    title: "홍대 재즈 페스타", venue: "롤링홀 · 마포",
    period: "2026.05.10 – 2026.05.11", running: "180분", area: "서울특별시",
    dday: 10, ddayLabel: "D-10",
  },
  {
    id: "mn10", theme: "red", genre: "연극",
    title: "파우스트", venue: "세종문화회관 M씨어터",
    period: "2026.05.07 – 2026.06.01", running: "130분", area: "서울특별시",
  },
  {
    id: "mn11", theme: "purple", genre: "무용",
    title: "국립발레단 갈라쇼", venue: "예술의전당 오페라극장",
    period: "2026.05.20 – 2026.05.25", running: "140분", area: "서울특별시",
  },
  {
    id: "mn12", theme: "blue", genre: "인디음악",
    title: "봄밤 인디 페스티벌", venue: "문화비축기지 T6",
    period: "2026.05.17 – 2026.05.18", running: "240분", area: "서울특별시",
    dday: 17, ddayLabel: "D-17",
  },
];

// Compact slices for the home feed
const COMPACT = { popular: 3, lastChance: 3, hidden: 2, nearby: 4 } as const;

export const MOCK_SHOWS: ShowsPayload = {
  popular:    popular.slice(0, COMPACT.popular),
  lastChance: lastChance.slice(0, COMPACT.lastChance),
  hidden:     hidden.slice(0, COMPACT.hidden),
  nearby:     nearby.slice(0, COMPACT.nearby),
  isMock: true,
};

export const MOCK_SHOWS_FULL: ShowsPayload = {
  popular, lastChance, hidden, nearby, isMock: true,
};
