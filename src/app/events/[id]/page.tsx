import { notFound } from "next/navigation";
import EventDetailPage, { EventConfig } from "@/components/events/EventDetailPage";

/* ─── 이벤트별 데이터 ──────────────────────────── */
const EVENT_CONFIGS: Record<string, EventConfig> = {
  e1: {
    id: "e1",
    title: "공연 인증 이벤트",
    desc: "공연을 관람하고 인증하면 XP를 획득해 캐릭터를 성장시킬 수 있어요. 꾸준한 관람으로 레벨업하고 특별한 혜택을 누려보세요!",
    badgeLabel: "이벤트 진행 중",
    heroBg: "linear-gradient(160deg, #0d1f2d 0%, #0a0f1e 50%, #1a0d2e 100%)",
    accentColor: "#f5c518",
    accentBg: "rgba(245,197,24,0.1)",
    reward: {
      xp: 50,
      badge: "이달의 관람러",
      benefitNote: "Lv.10 이상 우선 예매 혜택",
    },
    rewardItems: [
      "+50 XP 지급",
      "\"이달의 관람러\" 배지 획득",
      "Lv.10 이상 우선 예매 혜택",
    ],
    steps: [
      { step: 1, label: "공연 관람 완료" },
      { step: 2, label: "티켓, 현장 사진, 예매 내역 중 하나 업로드" },
      { step: 3, label: "인증 승인 대기" },
      { step: 4, label: "XP와 배지 지급" },
    ],
    notices: [
      "동일 공연은 1회만 인증 가능",
      "허위 인증은 보상 제외",
      "이벤트 보상은 운영 정책에 따라 변경 가능",
    ],
    ctaLabel: "인증하고 성장시키기",
    ctaDoneLabel: "인증 완료",
  },

  e2: {
    id: "e2",
    title: "5월 리뷰 챌린지",
    desc: "감상평 한 줄이 누군가의 공연 선택을 바꿉니다. 리뷰를 작성하고 6월 공연 티켓 2매 추첨 기회를 잡으세요!",
    badgeLabel: "챌린지 진행 중",
    heroBg: "linear-gradient(160deg, #001a08 0%, #000e04 55%, #0a0c0a 100%)",
    accentColor: "#34d399",
    accentBg: "rgba(52,211,153,0.1)",
    reward: {
      xp: 30,
      badge: "리뷰어",
      special: "티켓 2매 추첨",
    },
    rewardItems: [
      "+30 XP 지급",
      "\"리뷰어\" 배지 획득",
      "티켓 2매 추첨 (6월 공연 당첨)",
      "리뷰 누적 3개 이상 시 추첨 확률 2배",
    ],
    steps: [
      { step: 1, label: "공연 관람 후 앱에서 해당 공연 선택" },
      { step: 2, label: "100자 이상 감상평 작성 및 별점 등록" },
      { step: 3, label: "리뷰 검토 완료 (1~2일 소요)" },
      { step: 4, label: "XP 지급 및 티켓 추첨 자동 참여" },
    ],
    notices: [
      "리뷰는 공연 종료 후 7일 이내 작성 가능",
      "100자 미만 또는 도배성 리뷰는 보상 제외",
      "티켓 추첨 결과는 6월 1일 발표",
      "당첨자는 앱 알림 및 이메일로 개별 안내",
    ],
    ctaLabel: "리뷰 쓰고 참여하기",
    ctaDoneLabel: "참여 완료",
  },
};

/* ─── 페이지 ────────────────────────────────────── */
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const config = EVENT_CONFIGS[id];
  if (!config) notFound();
  return <EventDetailPage config={config} />;
}

export function generateStaticParams() {
  return Object.keys(EVENT_CONFIGS).map((id) => ({ id }));
}
