"use client";

import { useState, useEffect, useCallback } from "react";
import {
  REGIONS, Region,
  ChallengePerformance, ReviewData, ReviewStatus,
  VerificationData, VerificationStatus, ChallengeEntryState, defaultEntryState,
  getChallengePerformances, getNextMonthRewardPerformances,
  filterChallengeEligiblePerformances, filterRewardSelectablePerformances,
  submitReviewChallenge, submitVerification,
} from "@/lib/reviewChallengeService";
import { getUserPrefs } from "@/lib/userPrefs";
import {
  getCharacterProgress,
  grantCharacterXp,
  type CharacterProgress,
} from "@/lib/characterProgress";
import { CharacterEvolutionModal } from "@/components/guardian/CharacterEvolutionModal";
import { CharacterGrowthCard } from "@/components/guardian/CharacterGrowthCard";
import ReviewModal from "./ReviewModal";
import VerificationModal from "./VerificationModal";
import "./ReviewChallengePage.css";

const REWARD_XP = 30;
const ENTRY_STATE_KEY = "spotlight_challenge_entries_v2";

/* ─── 참여 단계 ─────────────────────────────────── */
const STEPS = [
  { step: 1, label: "지역 선택 후 참여 가능한 공연 확인" },
  { step: 2, label: "원하는 공연에서 관람 인증 진행" },
  { step: 3, label: "인증 완료 후 리뷰 작성" },
  { step: 4, label: "100자 이상 감상평 및 별점 등록" },
  { step: 5, label: "리뷰 검토 완료 후 XP 지급 및 추첨 자동 참여" },
];

const NOTICES = [
  "관람 인증이 완료된 공연만 리뷰 작성 가능",
  "티켓/예매내역 이미지는 검증 목적으로만 사용",
  "예매번호 중복 등록 불가",
  "리뷰는 공연 종료 후 7일 이내 작성 가능",
  "100자 미만 또는 도배성 리뷰는 보상 제외",
  "당첨자는 앱 알림 및 이메일로 개별 안내",
];

/* ─── 로컬 스토리지 ──────────────────────────────── */
function loadEntryStates(): Record<string, ChallengeEntryState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ENTRY_STATE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ChallengeEntryState>) : {};
  } catch {
    return {};
  }
}

function saveEntryStates(states: Record<string, ChallengeEntryState>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENTRY_STATE_KEY, JSON.stringify(states));
}

function getInitialRegion(): Region {
  const prefs = getUserPrefs();
  return prefs?.region && REGIONS.includes(prefs.region as Region)
    ? (prefs.region as Region)
    : "서울";
}

/* ─── 버튼 설정 ─────────────────────────────────── */
type BtnAction = "verify" | "review" | "claim" | "none";

function getBtnConfig(entry: ChallengeEntryState): {
  label: string;
  cls: string;
  disabled: boolean;
  action: BtnAction;
} {
  const { verificationStatus, reviewStatus } = entry;

  if (reviewStatus === "rewarded")
    return { label: "참여 완료 ✓", cls: "rewarded", disabled: true, action: "none" };
  if (reviewStatus === "approved")
    return { label: "보상 받기", cls: "approved", disabled: false, action: "claim" };
  if (reviewStatus === "pending")
    return { label: "검토 중...", cls: "pending", disabled: true, action: "none" };
  if (verificationStatus === "approved")
    return { label: "리뷰 쓰기", cls: "ver-approved", disabled: false, action: "review" };
  if (verificationStatus === "pending")
    return { label: "인증 검토 중", cls: "ver-pending", disabled: true, action: "none" };
  if (verificationStatus === "rejected")
    return { label: "반려됨 · 재인증", cls: "ver-rejected", disabled: false, action: "verify" };
  return { label: "관람 인증하기", cls: "none-state", disabled: false, action: "verify" };
}

/* ─── 뱃지 설정 ─────────────────────────────────── */
function getStatusBadge(entry: ChallengeEntryState): { label: string; cls: string } | null {
  const { verificationStatus, reviewStatus } = entry;

  if (reviewStatus === "rewarded" || reviewStatus === "approved")
    return { label: "참여 완료", cls: "badge-complete" };
  if (reviewStatus === "pending")
    return { label: "리뷰 검토 중", cls: "badge-review" };
  if (verificationStatus === "approved")
    return { label: "인증 완료", cls: "badge-verified" };
  if (verificationStatus === "pending")
    return { label: "인증 검토 중", cls: "badge-ver-pending" };
  if (verificationStatus === "rejected")
    return { label: "인증 반려됨", cls: "badge-rejected" };
  return { label: "관람 인증 필요", cls: "badge-unverified" };
}

/* ─── 컴포넌트 ──────────────────────────────────── */
export default function ReviewChallengePage() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(() => getInitialRegion());
  const [challengePerfs, setChallengePerfs] = useState<ChallengePerformance[]>([]);
  const [nextPerfs, setNextPerfs] = useState<ChallengePerformance[]>([]);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [loadingNext, setLoadingNext] = useState(true);

  const [entryStates, setEntryStates] = useState<Record<string, ChallengeEntryState>>(
    () => loadEntryStates()
  );
  const [verifyModal, setVerifyModal] = useState<ChallengePerformance | null>(null);
  const [reviewModal, setReviewModal] = useState<ChallengePerformance | null>(null);

  const [character, setCharacter] = useState<CharacterProgress>(() => getCharacterProgress());
  const [evolution, setEvolution] = useState<{
    previous: CharacterProgress;
    progress: CharacterProgress;
  } | null>(null);
  const [xpBoosted, setXpBoosted] = useState(false);

  const getEntry = useCallback(
    (id: string): ChallengeEntryState =>
      entryStates[id] ?? defaultEntryState(id),
    [entryStates]
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<ChallengeEntryState>) => {
      setEntryStates((prev) => {
        const current = prev[id] ?? defaultEntryState(id);
        const next = { ...prev, [id]: { ...current, ...patch } };
        saveEntryStates(next);
        return next;
      });
    },
    []
  );

  /* 챌린지 공연 로드 */
  useEffect(() => {
    const ac = new AbortController();
    getChallengePerformances(selectedRegion, ac.signal)
      .then((data) => {
        if (!ac.signal.aborted) {
          setChallengePerfs(filterChallengeEligiblePerformances(data));
          setLoadingChallenge(false);
        }
      })
      .catch(() => {
        if (!ac.signal.aborted) setLoadingChallenge(false);
      });
    return () => ac.abort();
  }, [selectedRegion]);

  /* 다음 달 보상 공연 로드 */
  useEffect(() => {
    const ac = new AbortController();
    getNextMonthRewardPerformances("전체", ac.signal)
      .then((data) => {
        if (!ac.signal.aborted) {
          setNextPerfs(filterRewardSelectablePerformances(data));
          setLoadingNext(false);
        }
      })
      .catch(() => {
        if (!ac.signal.aborted) setLoadingNext(false);
      });
    return () => ac.abort();
  }, []);

  /* 관람 인증 제출 */
  const handleVerificationSubmit = useCallback(
    async (data: VerificationData) => {
      if (!verifyModal) return;
      const id = verifyModal.id;
      setVerifyModal(null);
      updateEntry(id, {
        verificationStatus: "pending",
        reservationNumber: data.reservationNumber,
        ticketImageUrl: data.ticketImageUrl,
        watchedDate: data.watchedDate,
      });

      await submitVerification(id, data);

      /* 시뮬레이션: 관리자 승인 (실제 서비스에서는 admin API로 교체) */
      updateEntry(id, {
        verificationStatus: "approved",
        verifiedAt: new Date().toISOString(),
      });
    },
    [verifyModal, updateEntry]
  );

  /* 리뷰 제출 */
  const handleReviewSubmit = useCallback(
    async (data: ReviewData) => {
      if (!reviewModal) return;
      const id = reviewModal.id;
      setReviewModal(null);
      updateEntry(id, {
        reviewStatus: "pending" as ReviewStatus,
        reviewText: data.text,
        rating: data.rating,
      });

      await submitReviewChallenge(id, data);

      updateEntry(id, { reviewStatus: "approved" as ReviewStatus });
    },
    [reviewModal, updateEntry]
  );

  /* 보상 받기 */
  const handleClaimReward = useCallback(
    (id: string) => {
      updateEntry(id, {
        reviewStatus: "rewarded" as ReviewStatus,
        isRewarded: true,
        isChallengeEntered: true,
      });

      const result = grantCharacterXp(REWARD_XP, `review:${id}`);
      setCharacter(result.progress);

      if (!result.duplicated) {
        setXpBoosted(true);
        window.setTimeout(() => setXpBoosted(false), 1000);
      }
      if (result.didLevelUp) {
        setEvolution({ previous: result.previous, progress: result.progress });
      }
    },
    [updateEntry]
  );

  /* Hero CTA: 첫 번째 미인증 공연으로 인증 모달 열기 */
  const handleHeroCta = () => {
    const target =
      challengePerfs.find((p) => getEntry(p.id).verificationStatus === "none") ??
      challengePerfs[0];
    if (target) setVerifyModal(target);
  };

  const heroBtnLabel =
    challengePerfs.length === 0
      ? "공연 불러오는 중..."
      : challengePerfs.some((p) => getEntry(p.id).verificationStatus === "approved")
      ? "리뷰 쓰고 참여하기"
      : "관람 인증하고 참여하기";

  return (
    <div className="rc-page">

      {/* ── 진화 모달 ────────────────────────────── */}
      {evolution && (
        <CharacterEvolutionModal
          previous={evolution.previous}
          progress={evolution.progress}
          accentColor="#34d399"
          onClose={() => setEvolution(null)}
        />
      )}

      {/* ── 관람 인증 모달 ───────────────────────── */}
      {verifyModal && (
        <VerificationModal
          performance={verifyModal}
          rejectionReason={getEntry(verifyModal.id).rejectionReason}
          onSubmit={handleVerificationSubmit}
          onClose={() => setVerifyModal(null)}
        />
      )}

      {/* ── 리뷰 모달 ────────────────────────────── */}
      {reviewModal && (
        <ReviewModal
          performance={reviewModal}
          onSubmit={handleReviewSubmit}
          onClose={() => setReviewModal(null)}
        />
      )}

      {/* ── 히어로 ───────────────────────────────── */}
      <section className="rc-hero">
        <div className="rc-hero-badge">챌린지 진행 중</div>
        <h1 className="rc-hero-title">5월 리뷰 챌린지</h1>
        <p className="rc-hero-desc">
          지역별 숨은 공연을 직접 관람하고 리뷰를 남겨보세요.
          관람 인증 후 리뷰 작성 시 XP와 배지를 받고,
          추첨을 통해 다음 달 공연 티켓을 선택할 수 있습니다.
        </p>
        <div className="rc-hero-rewards">
          <span className="rc-hero-reward"><span>✨</span>+{REWARD_XP} XP</span>
          <span className="rc-hero-reward"><span>🏅</span>리뷰어 배지</span>
          <span className="rc-hero-reward"><span>🎟</span>티켓 선택권 추첨</span>
        </div>
        <button
          className="rc-hero-cta"
          onClick={handleHeroCta}
          disabled={challengePerfs.length === 0}
        >
          {heroBtnLabel}
        </button>
      </section>

      <div className="rc-content">
        <div className="rc-layout">
          <main className="rc-main-column">
            {/* ── 지역 필터 ─────────────────────────── */}
            <div className="rc-region-section">
              <div className="rc-region-scroll">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    className={`rc-region-chip${selectedRegion === r ? " active" : ""}`}
                    onClick={() => {
                      if (selectedRegion !== r) setLoadingChallenge(true);
                      setSelectedRegion(r);
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 챌린지 공연 ───────────────────────── */}
            <section className="rc-card">
              <div className="rc-section-header">
                <h2 className="rc-section-title">이번 달 참여 가능 공연</h2>
                {!loadingChallenge && (
                  <span className="rc-section-count">{challengePerfs.length}개</span>
                )}
              </div>

              {loadingChallenge ? (
                <SkeletonList />
              ) : challengePerfs.length === 0 ? (
                <EmptyState region={selectedRegion} />
              ) : (
                <div className="rc-perf-list">
                  {challengePerfs.map((perf) => {
                    const entry = getEntry(perf.id);
                    return (
                      <PerfCard
                        key={perf.id}
                        perf={perf}
                        entry={entry}
                        onVerify={() => setVerifyModal(perf)}
                        onReview={() => setReviewModal(perf)}
                        onClaim={() => handleClaimReward(perf.id)}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── 다음 달 선택 가능 공연 ──────────── */}
            <section className="rc-card">
              <div className="rc-section-header">
                <h2 className="rc-section-title">다음 달 선택 가능 공연</h2>
              </div>
              <p className="rc-next-desc">
                챌린지 당첨자는 아래 공연 중 원하는 공연을 선택해 티켓을 신청할 수 있습니다.
              </p>
              {loadingNext ? (
                <NextSkeletonList />
              ) : nextPerfs.length === 0 ? (
                <EmptyState region="전체" type="next" />
              ) : (
                <div className="rc-next-scroll">
                  {nextPerfs.map((perf) => (
                    <NextCard key={perf.id} perf={perf} />
                  ))}
                </div>
              )}
            </section>

            <div className="rc-mobile-only">
              <CharacterGrowthCard
                progress={character}
                accentColor="#34d399"
                rewardXp={REWARD_XP}
                boosted={xpBoosted}
              />
              <StepsCard />
              <NoticeCard />
            </div>
          </main>

          <aside className="rc-side-panel">
            <CharacterGrowthCard
              progress={character}
              accentColor="#34d399"
              rewardXp={REWARD_XP}
              boosted={xpBoosted}
            />
            <button
              className="rc-side-cta"
              onClick={handleHeroCta}
              disabled={challengePerfs.length === 0}
            >
              {heroBtnLabel}
            </button>
            <StepsCard />
            <NoticeCard />
          </aside>
        </div>
      </div>

      {/* ── 하단 고정 CTA ────────────────────── */}
      <div className="rc-fixed-cta">
        <button
          className="rc-fixed-btn"
          onClick={handleHeroCta}
          disabled={challengePerfs.length === 0}
        >
          {heroBtnLabel}
        </button>
      </div>

    </div>
  );
}

function StepsCard() {
  return (
    <section className="rc-card">
      <h2 className="rc-section-title" style={{ marginBottom: 16 }}>참여 방법</h2>
      <div className="rc-steps">
        {STEPS.map(({ step, label }) => (
          <div key={step} className="rc-step">
            <div className="rc-step-num">{step}</div>
            <span className="rc-step-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function NoticeCard() {
  return (
    <section className="rc-card rc-notice-card">
      <h2 className="rc-section-title rc-notice-title" style={{ marginBottom: 16 }}>유의사항</h2>
      <ul className="rc-notice-list">
        {NOTICES.map((n, i) => (
          <li key={i} className="rc-notice-item">
            <span className="rc-notice-dot" />{n}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── 공연 카드 ─────────────────────────────────── */
function PerfCard({
  perf, entry, onVerify, onReview, onClaim,
}: {
  perf: ChallengePerformance;
  entry: ChallengeEntryState;
  onVerify: () => void;
  onReview: () => void;
  onClaim: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const btn = getBtnConfig(entry);
  const badge = getStatusBadge(entry);

  const handleBtnClick = () => {
    if (btn.action === "verify") onVerify();
    else if (btn.action === "review") onReview();
    else if (btn.action === "claim") onClaim();
  };

  return (
    <div className="rc-perf-card">
      <div className="rc-perf-poster-wrap">
        {perf.poster && !imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perf.poster} alt={perf.title}
            className="rc-perf-poster"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="rc-perf-poster-fallback">🎭</span>
        )}
      </div>

      <div className="rc-perf-info">
        <div className="rc-perf-tags">
          <span className="rc-perf-genre-tag">{perf.genre}</span>
          {perf.region && <span className="rc-perf-region-tag">{perf.region}</span>}
        </div>
        <p className="rc-perf-title">{perf.title}</p>
        <p className="rc-perf-meta">{perf.place}</p>
        <p className="rc-perf-meta">{perf.startDate} ~ {perf.endDate}</p>

        <div className="rc-perf-bottom">
          {badge && (
            <span className={`rc-verify-badge ${badge.cls}`}>{badge.label}</span>
          )}
          <button
            className={`rc-review-btn ${btn.cls}`}
            onClick={handleBtnClick}
            disabled={btn.disabled}
          >
            {btn.label}
          </button>
        </div>

        {entry.verificationStatus === "rejected" && entry.rejectionReason && (
          <p className="rc-rejection-hint">반려 사유: {entry.rejectionReason}</p>
        )}
      </div>
    </div>
  );
}

/* ─── 다음 달 공연 카드 ──────────────────────────── */
function NextCard({ perf }: { perf: ChallengePerformance }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="rc-next-card">
      <div className="rc-next-poster-wrap">
        {perf.poster && !imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perf.poster} alt={perf.title}
            className="rc-next-poster"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="rc-next-poster-fallback">🎭</span>
        )}
        <span className="rc-next-ticket-tag">당첨 시 선택 가능</span>
      </div>
      <div className="rc-next-info">
        <p className="rc-next-title">{perf.title}</p>
        <p className="rc-next-meta">{perf.startDate}</p>
        <p className="rc-next-meta">{perf.place}</p>
        <p className="rc-next-tickets">티켓 2매</p>
      </div>
    </div>
  );
}

/* ─── 스켈레톤 / 빈 상태 ────────────────────────── */
function SkeletonList() {
  return (
    <div className="rc-skeleton-list">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rc-skeleton-card">
          <div className="rc-skel-poster" />
          <div className="rc-skel-lines">
            <div className="rc-skel-line long" />
            <div className="rc-skel-line mid" />
            <div className="rc-skel-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NextSkeletonList() {
  return (
    <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          flexShrink: 0, width: 140, height: 240,
          borderRadius: 16, background: "rgba(255,255,255,0.05)",
          animation: "rc-shimmer 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}

function EmptyState({ region, type }: { region: string; type?: "next" }) {
  return (
    <div className="rc-empty">
      <div className="rc-empty-icon">🔍</div>
      <p>
        {type === "next"
          ? "다음 달 공연 정보를 불러오는 중이에요."
          : `${region === "전체" ? "현재" : region} 지역의 참여 가능한 공연이 없어요.`}
        <br />
        다른 지역을 선택하거나 잠시 후 다시 확인해보세요.
      </p>
    </div>
  );
}
