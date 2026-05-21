/* ─── 타입 ──────────────────────────────────────── */

export interface ChallengePerformance {
  id: string;
  title: string;
  place: string;
  startDate: string; // YYYY.MM.DD
  endDate: string;
  poster: string | null;
  genre: string;
  state: string;
  region: string;
  discoveryScore?: number;
}

export interface ReviewData {
  rating: number; // 1-5
  text: string;
}

export type ReviewStatus = "idle" | "pending" | "approved" | "rewarded";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export interface VerificationData {
  reservationNumber: string;
  ticketImageUrl: string;
  watchedDate: string;
}

export interface ChallengeEntryState {
  performanceId: string;
  verificationStatus: VerificationStatus;
  reservationNumber?: string;
  ticketImageUrl?: string;
  watchedDate?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  reviewStatus: ReviewStatus;
  reviewText?: string;
  rating?: number;
  isRewarded: boolean;
  isChallengeEntered: boolean;
}

export function defaultEntryState(performanceId: string): ChallengeEntryState {
  return {
    performanceId,
    verificationStatus: "none",
    reviewStatus: "idle",
    isRewarded: false,
    isChallengeEntered: false,
  };
}

/* ─── 상수 ──────────────────────────────────────── */

export const REGIONS = [
  "전체", "서울", "경기", "인천", "부산", "대구",
  "광주", "대전", "울산", "세종", "강원",
  "충북", "충남", "전북", "전남", "경북", "경남", "제주",
] as const;

export type Region = typeof REGIONS[number];

/* ─── 지역 분류 ─────────────────────────────────── */

const REGION_KEYWORDS: [string, string[]][] = [
  ["서울",  ["서울"]],
  ["부산",  ["부산"]],
  ["대구",  ["대구"]],
  ["인천",  ["인천"]],
  ["광주",  ["광주"]],
  ["대전",  ["대전"]],
  ["울산",  ["울산"]],
  ["세종",  ["세종"]],
  ["경기",  ["경기"]],
  ["강원",  ["강원"]],
  ["충북",  ["충북", "충청북도"]],
  ["충남",  ["충남", "충청남도"]],
  ["전북",  ["전북", "전라북도"]],
  ["전남",  ["전남", "전라남도"]],
  ["경북",  ["경북", "경상북도"]],
  ["경남",  ["경남", "경상남도"]],
  ["제주",  ["제주"]],
];

export function classifyRegionByAddress(address: string): string {
  for (const [region, keywords] of REGION_KEYWORDS) {
    if (keywords.some((kw) => address.includes(kw))) return region;
  }
  return "전체";
}

/* ─── API 호출 ──────────────────────────────────── */

/**
 * 이번 달 리뷰 챌린지 참여 가능 공연 목록
 * → 교체 지점: 실제 API 연동 시 이 함수 내부만 수정
 */
export async function getChallengePerformances(
  region: string,
  signal?: AbortSignal
): Promise<ChallengePerformance[]> {
  const params = new URLSearchParams({ region, type: "current" });
  const res = await fetch(`/api/challenge-performances?${params}`, { signal });
  if (!res.ok) return [];
  return res.json();
}

/**
 * 다음 달 당첨 시 선택 가능한 공연 목록
 * → 교체 지점: 실제 API 연동 시 이 함수 내부만 수정
 */
export async function getNextMonthRewardPerformances(
  region?: string,
  signal?: AbortSignal
): Promise<ChallengePerformance[]> {
  const params = new URLSearchParams({ region: region ?? "전체", type: "next" });
  const res = await fetch(`/api/challenge-performances?${params}`, { signal });
  if (!res.ok) return [];
  return res.json();
}

/* ─── 필터링 ────────────────────────────────────── */

/**
 * 챌린지 참여 가능 공연 필터링
 * - 발견 가치 점수 높은 순으로 최대 20개
 * - 소규모·창작·지역 공연 우선, 대형 공연도 포함 가능
 */
export function filterChallengeEligiblePerformances(
  performances: ChallengePerformance[]
): ChallengePerformance[] {
  return performances.slice(0, 20);
}

/**
 * 보상 선택 가능 공연 필터링
 * - 다음 달 공연 중 참여 인원수 등 고려해 12개
 */
export function filterRewardSelectablePerformances(
  performances: ChallengePerformance[]
): ChallengePerformance[] {
  return performances.slice(0, 12);
}

/* ─── 리뷰 제출 ─────────────────────────────────── */

/**
 * 관람 인증 제출
 * TODO: POST /api/verify-attendance
 */
export async function submitVerification(
  _performanceId: string,
  _data: VerificationData
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 800));
  return { success: true };
}

/**
 * 리뷰 챌린지 제출
 * TODO: POST /api/review-challenge
 */
export async function submitReviewChallenge(
  _performanceId: string,
  _reviewData: ReviewData
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 900));
  return { success: true };
}
