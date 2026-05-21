export interface TasteScores {
  emotional: number;
  stimulation: number;
  story: number;
  performance: number;
  solo: number;
  social: number;
  classic: number;
  experimental: number;
}

export type TasteTypeName =
  | "emotional-story"
  | "dopamine-performer"
  | "night-healer"
  | "trend-collector";

export interface TasteOption {
  label: string;
  sub: string;
  trait: keyof TasteScores;
  score: number;
}

export interface TasteQuestion {
  id: number;
  question: string;
  options: [TasteOption, TasteOption];
}

export interface TasteTypeResult {
  id: TasteTypeName;
  name: string;
  emoji: string;
  description: string;
  traits: string[];
  recommendedGenres: string[];
  moodTags: string[];
  message: string;
  color: string;
  bgGradient: string;
}

export const INITIAL_SCORES: TasteScores = {
  emotional: 0,
  stimulation: 0,
  story: 0,
  performance: 0,
  solo: 0,
  social: 0,
  classic: 0,
  experimental: 0,
};

export const TASTE_QUESTIONS: TasteQuestion[] = [
  {
    id: 1,
    question: "공연이 끝난 뒤 더 오래 기억나는 건?",
    options: [
      { label: "마음을 울린 마지막 대사", sub: "감정이 오래 남는 순간", trait: "emotional", score: 2 },
      { label: "소름 돋는 무대 연출", sub: "눈을 압도하는 장면", trait: "stimulation", score: 2 },
    ],
  },
  {
    id: 2,
    question: "더 끌리는 공연은?",
    options: [
      { label: "잔잔하게 몰입하는 이야기", sub: "스토리가 마음에 스며드는", trait: "story", score: 2 },
      { label: "눈을 뗄 수 없는 퍼포먼스", sub: "에너지가 폭발하는", trait: "performance", score: 2 },
    ],
  },
  {
    id: 3,
    question: "공연은 보통 어떻게 즐기고 싶어?",
    options: [
      { label: "혼자 깊게 몰입", sub: "나만의 세계로 빠져드는", trait: "solo", score: 2 },
      { label: "누군가와 함께 즐기기", sub: "함께 느끼는 공감대", trait: "social", score: 2 },
    ],
  },
  {
    id: 4,
    question: "공연 선택 기준은?",
    options: [
      { label: "익숙하고 검증된 작품", sub: "믿고 보는 검증된 공연", trait: "classic", score: 2 },
      { label: "새롭고 실험적인 공연", sub: "아무도 모르는 새로운 것", trait: "experimental", score: 2 },
    ],
  },
  {
    id: 5,
    question: "더 좋아하는 분위기는?",
    options: [
      { label: "감성적이고 여운 있는 분위기", sub: "마음이 따뜻해지는", trait: "emotional", score: 2 },
      { label: "강렬하고 텐션 높은 분위기", sub: "심장이 두근대는", trait: "stimulation", score: 2 },
    ],
  },
  {
    id: 6,
    question: "공연에서 가장 중요한 건?",
    options: [
      { label: "스토리와 메시지", sub: "생각할 거리를 남기는", trait: "story", score: 2 },
      { label: "배우와 무대의 에너지", sub: "현장감 넘치는 열기", trait: "performance", score: 2 },
    ],
  },
  {
    id: 7,
    question: "어떤 공연 포스터가 더 끌려?",
    options: [
      { label: "따뜻한 감성 디자인", sub: "부드럽고 감성적인", trait: "classic", score: 2 },
      { label: "독특하고 강렬한 비주얼", sub: "눈에 확 들어오는", trait: "experimental", score: 2 },
    ],
  },
  {
    id: 8,
    question: "공연 후 나는 보통?",
    options: [
      { label: "혼자 여운을 오래 느낀다", sub: "혼자 조용히 소화하는", trait: "solo", score: 2 },
      { label: "바로 후기 공유하고 싶다", sub: "바로 공유하고 싶은", trait: "social", score: 2 },
    ],
  },
];

export const TASTE_TYPES: TasteTypeResult[] = [
  {
    id: "emotional-story",
    name: "감성 스토리 탐험가",
    emoji: "🎭",
    description: "감정선 중심 · 여운 있는 공연 · 몰입형 관람",
    traits: ["감정선 중심", "여운 있는 공연 선호", "몰입형 관람 스타일"],
    recommendedGenres: ["뮤지컬", "연극"],
    moodTags: ["감성", "스토리중심", "감정선", "힐링"],
    message: "당신은 공연이 끝난 뒤에도 오래 여운을 간직하는 타입입니다.",
    color: "#a78bfa",
    bgGradient: "linear-gradient(135deg, #0d0520 0%, #080014 100%)",
  },
  {
    id: "dopamine-performer",
    name: "도파민 퍼포머",
    emoji: "⚡",
    description: "강렬한 무대 · 에너지 중시 · 화려한 공연 취향",
    traits: ["강렬한 무대 선호", "몰입감과 에너지 중시", "화려한 공연 취향"],
    recommendedGenres: ["뮤지컬", "서커스"],
    moodTags: ["스릴", "퍼포먼스", "텐션높음", "몰입형"],
    message: "당신은 심장이 뛰는 순간을 찾아 공연장을 탐험하는 타입입니다.",
    color: "#fbbf24",
    bgGradient: "linear-gradient(135deg, #1a0e00 0%, #0f0800 100%)",
  },
  {
    id: "night-healer",
    name: "야간 감성 힐러",
    emoji: "🌙",
    description: "조용한 감성 · 혼공족 성향 · 분위기 중시",
    traits: ["조용한 감성", "혼공족 성향", "분위기 중시"],
    recommendedGenres: ["재즈", "클래식"],
    moodTags: ["힐링", "혼공추천", "감성", "OST"],
    message: "당신은 조용한 감정과 분위기 속에서 공연을 즐기는 타입입니다.",
    color: "#60a5fa",
    bgGradient: "linear-gradient(135deg, #001020 0%, #000c18 100%)",
  },
  {
    id: "trend-collector",
    name: "트렌드 컬렉터",
    emoji: "🎟",
    description: "새로운 공연 탐험 · SNS 공유 성향 · 유행 민감형",
    traits: ["새로운 공연 탐험", "SNS 공유 성향", "유행 민감형"],
    recommendedGenres: ["연극", "무용"],
    moodTags: ["실험적", "커플추천", "몰입형", "퍼포먼스"],
    message: "당신은 가장 먼저 새로운 공연을 발견하고 공유하는 타입입니다.",
    color: "#34d399",
    bgGradient: "linear-gradient(135deg, #001810 0%, #000e08 100%)",
  },
];

export function calculateTasteType(scores: TasteScores): TasteTypeResult {
  const typeScores: Record<TasteTypeName, number> = {
    "emotional-story": scores.emotional + scores.story,
    "dopamine-performer": scores.stimulation + scores.performance,
    "night-healer": scores.emotional + scores.solo,
    "trend-collector": scores.experimental + scores.social,
  };

  const topType = (Object.entries(typeScores) as [TasteTypeName, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  return TASTE_TYPES.find((t) => t.id === topType) ?? TASTE_TYPES[0];
}

export function getTasteTypeById(id: string): TasteTypeResult | undefined {
  return TASTE_TYPES.find((t) => t.id === id);
}
