// SVG viewBox "0 0 380 510"
// x = (경도 - 125.5) × 84
// y = (38.7 - 위도)  × 86

export interface RegionDot {
  id: string;
  name: string;
  cx: number;
  cy: number;
}

export const ALL_REGION_DOTS: RegionDot[] = [
  // 특별시/광역시
  { id: "seoul",     name: "서울", cx: 123, cy:  97 }, // 37.57°N 126.97°E
  { id: "incheon",   name: "인천", cx:  97, cy: 109 }, // 37.46°N 126.71°E
  { id: "daejeon",   name: "대전", cx: 158, cy: 202 }, // 36.35°N 127.38°E
  { id: "daegu",     name: "대구", cx: 261, cy: 245 }, // 35.87°N 128.60°E
  { id: "gwangju",   name: "광주", cx: 113, cy: 305 }, // 35.15°N 126.85°E
  { id: "busan",     name: "부산", cx: 293, cy: 306 }, // 35.18°N 129.08°E
  { id: "ulsan",     name: "울산", cx: 318, cy: 272 }, // 35.54°N 129.31°E
  // 특별자치시
  { id: "sejong",    name: "세종", cx: 144, cy: 189 }, // 36.48°N 127.29°E
  // 도
  { id: "gyeonggi",  name: "경기", cx: 140, cy: 130 }, // 37.26°N 127.01°E (수원 기준)
  { id: "gangwon",   name: "강원", cx: 240, cy:  80 }, // 37.77°N 128.36°E (중심)
  { id: "chungbuk",  name: "충북", cx: 198, cy: 175 }, // 36.64°N 127.49°E (청주)
  { id: "chungnam",  name: "충남", cx:  99, cy: 182 }, // 36.60°N 126.66°E (홍성)
  { id: "jeonbuk",   name: "전북", cx: 139, cy: 248 }, // 35.82°N 127.15°E (전주)
  { id: "jeonnam",   name: "전남", cx: 140, cy: 319 }, // 35.04°N 127.10°E (중심)
  { id: "gyeongbuk", name: "경북", cx: 267, cy: 191 }, // 36.58°N 128.73°E (안동)
  { id: "gyeongnam", name: "경남", cx: 253, cy: 297 }, // 35.46°N 128.23°E (창원)
  // 특별자치도
  { id: "jeju",      name: "제주", cx:  88, cy: 462 }, // 33.38°N 126.55°E
];
