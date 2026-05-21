export const MOOD_BUTTON_LIST = [
  { label: "봄 감성", keyword: "봄", emoji: "🌸" },
  { label: "여름 밤", keyword: "여름", emoji: "🌊" },
  { label: "따뜻한", keyword: "따뜻한", emoji: "☀️" },
  { label: "힐링", keyword: "힐링", emoji: "🌿" },
  { label: "데이트", keyword: "데이트", emoji: "💝" },
  { label: "혼자 보기 좋은", keyword: "혼자", emoji: "🌙" },
  { label: "비 오는 날", keyword: "비", emoji: "🌧️" },
  { label: "입문자 추천", keyword: "입문자", emoji: "✨" },
];

const MOOD_KEYWORD_LIST = [
  "봄", "여름", "가을", "겨울",
  "따뜻한", "힐링", "감성적인", "설레는",
  "데이트", "혼자", "가족", "친구", "비",
  "입문자", "저렴한", "힐링되는",
];

export function isMoodKeyword(keyword: string): boolean {
  const kw = keyword.trim().toLowerCase();
  return MOOD_KEYWORD_LIST.some((m) => kw.includes(m) || m.includes(kw));
}

const GENRE_MOOD: Record<string, string[]> = {
  "뮤지컬":          ["데이트", "설레는", "감성적인"],
  "연극":             ["혼자", "감성적인", "힐링"],
  "서양음악(클래식)": ["혼자", "힐링", "따뜻한"],
  "클래식":           ["혼자", "힐링", "따뜻한"],
  "재즈":             ["데이트", "설레는", "비"],
  "대중음악":         ["친구", "데이트", "여름"],
  "무용(발레)":       ["감성적인", "힐링", "따뜻한"],
  "무용(현대무용)":   ["감성적인", "힐링"],
  "무용(한국무용)":   ["가족", "입문자"],
  "한국음악(국악)":   ["가족", "입문자"],
  "서커스/마술":      ["가족", "입문자"],
  "무용":             ["감성적인", "힐링"],
};

const TITLE_RULES: { pattern: RegExp; tags: string[] }[] = [
  { pattern: /봄|spring/i,           tags: ["봄", "따뜻한", "설레는"] },
  { pattern: /여름|summer/i,         tags: ["여름"] },
  { pattern: /가을|autumn|fall/i,    tags: ["가을", "감성적인"] },
  { pattern: /겨울|winter/i,         tags: ["겨울"] },
  { pattern: /사랑|love|romance|로맨/i, tags: ["데이트", "설레는"] },
  { pattern: /가족|family/i,         tags: ["가족"] },
  { pattern: /어린이|아동|kids/i,    tags: ["가족", "입문자"] },
  { pattern: /힐링|healing/i,        tags: ["힐링"] },
  { pattern: /재즈|jazz/i,           tags: ["데이트", "비"] },
];

export function assignMoodTags(show: { genre: string; title: string }): string[] {
  const tags = new Set<string>();

  for (const [key, vals] of Object.entries(GENRE_MOOD)) {
    if (show.genre === key || show.genre.includes(key) || key.includes(show.genre)) {
      vals.forEach((t) => tags.add(t));
    }
  }

  for (const { pattern, tags: ruleTags } of TITLE_RULES) {
    if (pattern.test(show.title)) {
      ruleTags.forEach((t) => tags.add(t));
    }
  }

  return [...tags];
}

export function matchesMoodKeyword(moodTags: string[], keyword: string): boolean {
  const kw = keyword.trim().toLowerCase();
  return moodTags.some((tag) => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()));
}

export const CHATBOT_KEYWORD_MAP: Record<string, string[]> = {
  "여름":   ["여름", "친구", "데이트"],
  "봄":     ["봄", "따뜻한", "설레는"],
  "가을":   ["가을", "감성적인", "힐링"],
  "겨울":   ["겨울", "따뜻한"],
  "따뜻":   ["따뜻한", "힐링"],
  "힐링":   ["힐링", "따뜻한", "감성적인"],
  "감성":   ["감성적인", "힐링", "설레는"],
  "데이트": ["데이트", "설레는"],
  "혼자":   ["혼자", "힐링", "감성적인"],
  "가족":   ["가족", "입문자"],
  "비":     ["비", "힐링", "감성적인"],
  "입문":   ["입문자"],
  "저렴":   ["입문자"],
  "친구":   ["친구", "여름", "데이트"],
};
