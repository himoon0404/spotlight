export interface GuardianStage {
  level: number;
  name: string;
  title: string;
  description: string;
  color: string;
  accent: string;
  items: string[];
}

export const GUARDIAN_STAGES: GuardianStage[] = [
  {
    level: 1,
    name: "작은 빛 구슬",
    title: "경험의 시작",
    description:
      "공연 세계에 첫 발을 내딛는 순수한 빛의 씨앗. 아직 형태를 갖추지 못했지만, 내면에 무한한 가능성이 잠들어 있다.",
    color: "#FFE082",
    accent: "#FFB300",
    items: ["빛 구슬 (Light Core)"],
  },
  {
    level: 2,
    name: "빛 오라 생성",
    title: "발견의 첫걸음",
    description:
      "첫 공연을 발견하고 빛 고리가 생성된다. 공연의 파동이 몸 주위를 맴돌며 가능성이 조금씩 윤곽을 드러낸다.",
    color: "#FFD700",
    accent: "#FFA500",
    items: ["빛 고리 ×2 (Light Rings)", "홀로그래픽 에셋 (Holographic Assets)"],
  },
  {
    level: 3,
    name: "헤드셋 요정",
    title: "공연 소리를 찾아서",
    description:
      "공연의 음악과 대사를 흡수하기 위해 헤드셋을 장착했다. 이제 공연의 소리를 듣고 그 의미를 이해하기 시작한다.",
    color: "#E040FB",
    accent: "#9C27B0",
    items: ["헤드셋 (Headset)"],
  },
  {
    level: 4,
    name: "리뷰 요정",
    title: "첫 번째 리뷰 작성",
    description:
      "생애 첫 리뷰를 남기며 팔과 망토가 생성된다. 이제 공연에 대한 의견을 세상에 전달하고 다른 이들과 감동을 나눌 수 있다.",
    color: "#CE93D8",
    accent: "#7B1FA2",
    items: ["작은 팔 (Arms)", "망토 (Mantle)"],
  },
  {
    level: 5,
    name: "티켓 수집가",
    title: "티켓 수집가의 꿈",
    description:
      "가슴 중앙에 공연 티켓 코어가 생성된다. 관람한 모든 공연의 에너지가 이 코어에 결정화되어 영원히 빛을 발한다.",
    color: "#AB47BC",
    accent: "#6A1B9A",
    items: ["공연 티켓 코어 (Ticket Core)"],
  },
  {
    level: 6,
    name: "날개 요정",
    title: "열정의 에너지",
    description:
      "공연에 대한 열정이 폭발하며 네온 날개가 돋아난다. 더 넓은 공연 세계로 날아오를 준비가 완성되었다.",
    color: "#9C27B0",
    accent: "#4A148C",
    items: ["네온 날개 (Neon Wings)", "빛 고리 추가 (Extra Rings)"],
  },
  {
    level: 7,
    name: "공연 탐험가",
    title: "큐레이션의 시작",
    description:
      "홀로그래픽 공연 포스터와 음악 아이콘이 생성된다. 이제 공연을 추천하고 큐레이션하는 존재로 거듭난다.",
    color: "#7B1FA2",
    accent: "#38006b",
    items: ["홀로그래픽 포스터 (Holographic Poster)", "음악 아이콘 ×3 (Music Icons)"],
  },
  {
    level: 8,
    name: "스포트라이트 요정",
    title: "스테이지 마스터의 조건",
    description:
      "다층 기하학적 구조와 추가 날개가 생성된다. 공연 무대 그 자체를 몸으로 표현하는 단계에 진입했다.",
    color: "#D4AF37",
    accent: "#B8860B",
    items: ["다층 기하 구조 (Multi-layer)", "추가 날개 ×2 (Extra Wings)", "황금 아머 (Gold Armor)"],
  },
  {
    level: 9,
    name: "황금 티켓 요정",
    title: "공연 수호의 의지",
    description:
      "황금 장식과 고급 공연 아머가 형성된다. 공연 예술의 수호자로서 그 존재감이 무대 전체를 압도한다.",
    color: "#FFD700",
    accent: "#D4AF37",
    items: ["황금 장식 (Gold Decoration)", "공연 아머 (Concert Armor)"],
  },
  {
    level: 10,
    name: "전설의 SPOTLIGHT",
    title: "전설의 SPOTLIGHT 마스터",
    description:
      "모든 단계의 요소가 하나로 융합된 완전한 형태. 거대한 스포트라이트 날개, 마스터 휠, 찬란한 에너지 코어가 합쳐진 공연 예술의 전설이 탄생한다.",
    color: "#FFD700",
    accent: "#E040FB",
    items: ["거대 스포트라이트 날개 (Spotlight Wings)", "마스터 휠 (Master Wheel)", "찬란한 에너지 코어 (Brilliant Core)"],
  },
];

export function getStageLevel(level: number): number {
  return Math.min(Math.max(Math.floor(level) || 1, 1), GUARDIAN_STAGES.length);
}

export function getGuardianStage(level: number): GuardianStage {
  return GUARDIAN_STAGES[getStageLevel(level) - 1];
}
