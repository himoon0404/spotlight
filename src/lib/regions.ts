export interface SubRegionInfo {
  id: string;
  name: string;
  kopisSubCode: string; // 3-digit signgucodesub for KOPIS API
}

export interface RegionInfo {
  id: string;
  name: string;
  emoji: string;
  kopisCode: string;
  lat: number;
  lng: number;
  subRegions?: SubRegionInfo[];
}

export const ALL_REGIONS: RegionInfo[] = [
  // 수도권
  { id: "seoul",     name: "서울",  emoji: "🏙️", kopisCode: "11", lat: 37.57, lng: 126.98 },
  { id: "incheon",   name: "인천",  emoji: "✈️", kopisCode: "28", lat: 37.46, lng: 126.71 },
  {
    id: "gyeonggi",  name: "경기",  emoji: "🌿", kopisCode: "41", lat: 37.26, lng: 127.01,
    subRegions: [
      { id: "suwon",      name: "수원",   kopisSubCode: "111" },
      { id: "seongnam",   name: "성남",   kopisSubCode: "131" },
      { id: "goyang",     name: "고양",   kopisSubCode: "281" },
      { id: "yongin",     name: "용인",   kopisSubCode: "461" },
      { id: "bucheon",    name: "부천",   kopisSubCode: "190" },
      { id: "ansan",      name: "안산",   kopisSubCode: "271" },
      { id: "anyang",     name: "안양",   kopisSubCode: "171" },
      { id: "namyangju",  name: "남양주", kopisSubCode: "360" },
      { id: "hwaseong",   name: "화성",   kopisSubCode: "590" },
      { id: "pyeongtaek", name: "평택",   kopisSubCode: "220" },
      { id: "paju",       name: "파주",   kopisSubCode: "480" },
      { id: "gimpo",      name: "김포",   kopisSubCode: "570" },
    ],
  },
  {
    id: "gangwon",   name: "강원",  emoji: "⛰️", kopisCode: "42", lat: 37.77, lng: 128.36,
    subRegions: [
      { id: "chuncheon", name: "춘천", kopisSubCode: "110" },
      { id: "wonju",     name: "원주", kopisSubCode: "130" },
      { id: "gangneung", name: "강릉", kopisSubCode: "150" },
      { id: "donghae",   name: "동해", kopisSubCode: "170" },
      { id: "sokcho",    name: "속초", kopisSubCode: "210" },
      { id: "samcheok",  name: "삼척", kopisSubCode: "230" },
    ],
  },
  // 충청
  {
    id: "chungbuk",  name: "충북",  emoji: "🌾", kopisCode: "43", lat: 36.64, lng: 127.49,
    subRegions: [
      { id: "cheongju", name: "청주", kopisSubCode: "111" },
      { id: "chungju",  name: "충주", kopisSubCode: "130" },
      { id: "jecheon",  name: "제천", kopisSubCode: "150" },
    ],
  },
  {
    id: "chungnam",  name: "충남",  emoji: "🌊", kopisCode: "44", lat: 36.52, lng: 126.80,
    subRegions: [
      { id: "cheonan", name: "천안", kopisSubCode: "131" },
      { id: "gongju",  name: "공주", kopisSubCode: "150" },
      { id: "boryeong",name: "보령", kopisSubCode: "180" },
      { id: "asan",    name: "아산", kopisSubCode: "200" },
      { id: "seosan",  name: "서산", kopisSubCode: "210" },
      { id: "nonsan",  name: "논산", kopisSubCode: "230" },
      { id: "dangjin", name: "당진", kopisSubCode: "270" },
    ],
  },
  { id: "sejong",    name: "세종",  emoji: "🏛️", kopisCode: "36", lat: 36.48, lng: 127.29 },
  { id: "daejeon",   name: "대전",  emoji: "🔬", kopisCode: "30", lat: 36.35, lng: 127.38 },
  // 전라
  {
    id: "jeonbuk",   name: "전북",  emoji: "🏯", kopisCode: "45", lat: 35.82, lng: 127.15,
    subRegions: [
      { id: "jeonju",   name: "전주", kopisSubCode: "113" },
      { id: "gunsan",   name: "군산", kopisSubCode: "140" },
      { id: "iksan",    name: "익산", kopisSubCode: "182" },
      { id: "jeongeup", name: "정읍", kopisSubCode: "210" },
      { id: "namwon",   name: "남원", kopisSubCode: "230" },
      { id: "gimje",    name: "김제", kopisSubCode: "250" },
    ],
  },
  {
    id: "jeonnam",   name: "전남",  emoji: "🌸", kopisCode: "46", lat: 34.87, lng: 126.99,
    subRegions: [
      { id: "mokpo",    name: "목포", kopisSubCode: "110" },
      { id: "yeosu",    name: "여수", kopisSubCode: "130" },
      { id: "suncheon", name: "순천", kopisSubCode: "150" },
      { id: "naju",     name: "나주", kopisSubCode: "170" },
      { id: "gwangyang",name: "광양", kopisSubCode: "230" },
    ],
  },
  { id: "gwangju",   name: "광주",  emoji: "🌻", kopisCode: "29", lat: 35.16, lng: 126.85 },
  // 경상
  {
    id: "gyeongbuk", name: "경북",  emoji: "🏔️", kopisCode: "47", lat: 36.58, lng: 128.73,
    subRegions: [
      { id: "pohang",   name: "포항", kopisSubCode: "111" },
      { id: "gyeongju", name: "경주", kopisSubCode: "130" },
      { id: "gimcheon", name: "김천", kopisSubCode: "150" },
      { id: "andong",   name: "안동", kopisSubCode: "170" },
      { id: "gumi",     name: "구미", kopisSubCode: "190" },
      { id: "yeongju",  name: "영주", kopisSubCode: "210" },
      { id: "gyeongsan",name: "경산", kopisSubCode: "290" },
    ],
  },
  { id: "daegu",     name: "대구",  emoji: "🍎", kopisCode: "27", lat: 35.87, lng: 128.60 },
  {
    id: "gyeongnam", name: "경남",  emoji: "🌿", kopisCode: "48", lat: 35.46, lng: 128.21,
    subRegions: [
      { id: "changwon", name: "창원", kopisSubCode: "121" },
      { id: "jinju",    name: "진주", kopisSubCode: "170" },
      { id: "tongyeong",name: "통영", kopisSubCode: "220" },
      { id: "sacheon",  name: "사천", kopisSubCode: "240" },
      { id: "gimhae",   name: "김해", kopisSubCode: "250" },
      { id: "milyang",  name: "밀양", kopisSubCode: "270" },
      { id: "geoje",    name: "거제", kopisSubCode: "310" },
      { id: "yangsan",  name: "양산", kopisSubCode: "330" },
    ],
  },
  { id: "busan",     name: "부산",  emoji: "🌊", kopisCode: "26", lat: 35.18, lng: 129.08 },
  { id: "ulsan",     name: "울산",  emoji: "🏭", kopisCode: "31", lat: 35.54, lng: 129.31 },
  // 제주
  { id: "jeju",      name: "제주",  emoji: "🌴", kopisCode: "50", lat: 33.49, lng: 126.50 },
];

export const ALL_REGION_NAMES = ALL_REGIONS.map((r) => r.name);

export const REGION_KOPIS_CODE: Record<string, string> = Object.fromEntries(
  ALL_REGIONS.map((r) => [r.name, r.kopisCode])
);

// city name → { province area code, 3-digit signgucodesub }
export const SUB_REGION_LOOKUP: Record<string, { areaCode: string; subCode: string }> =
  Object.fromEntries(
    ALL_REGIONS.flatMap((r) =>
      (r.subRegions ?? []).map((s) => [s.name, { areaCode: r.kopisCode, subCode: s.kopisSubCode }])
    )
  );
