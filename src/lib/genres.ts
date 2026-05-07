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
