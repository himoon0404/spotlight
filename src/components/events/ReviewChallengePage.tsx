"use client";

import { useState, useEffect, useCallback } from "react";
import {
  REGIONS, Region,
  ChallengePerformance, ReviewData, ReviewStatus,
  getChallengePerformances, getNextMonthRewardPerformances,
  filterChallengeEligiblePerformances, filterRewardSelectablePerformances,
  submitReviewChallenge,
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
import "./ReviewChallengePage.css";

const REWARD_XP = 30;
const REVIEW_STATE_KEY = "spotlight_review_challenge_states";

/* ─── 참여 단계 ─────────────────────────────────── */
const STEPS = [
  { step: 1, label: "지역 선택 후 참여 가능한 공연 확인" },
  { step: 2, label: "공연 관람 후 앱에서 해당 공연 선택" },
  { step: 3, label: "100자 이상 감상평 및 별점 등록" },
  { step: 4, label: "리뷰 검토 완료 후 XP 지급 및 추첨 자동 참여" },
  { step: 5, label: "당첨 시 다음 달 공연 중 원하는 공연 선택" },
];

const NOTICES = [
  "리뷰는 공연 종료 후 7일 이내 작성 가능",
  "100자 미만 또는 도배성 리뷰는 보상 제외",
  "티켓 추첨 결과는 6월 1일 발표",
  "당첨자는 앱 알림 및 이메일로 개별 안내",
  "이벤트 보상은 운영 정책에 따라 변경 가능",
];

function loadReviewStates(): Record<string, ReviewStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REVIEW_STATE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ReviewStatus>) : {};
  } catch {
    return {};
  }
}

function saveReviewStates(states: Record<string, ReviewStatus>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(states));
}

function getInitialRegion(): Region {
  const prefs = getUserPrefs();
  return prefs?.region && REGIONS.includes(prefs.region as Region)
    ? prefs.region as Region
    : "서울";
}

/* ─── 리뷰 버튼 라벨 ────────────────────────────── */
function reviewBtnLabel(status: ReviewStatus): string {
  switch (status) {
    case "pending":  return "검토 중...";
    case "approved": return "보상 받기";
    case "rewarded": return "참여 완료 ✓";
    default:         return "리뷰 쓰기";
  }
}

/* ─── 컴포넌트 ──────────────────────────────────── */
export default function ReviewChallengePage() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(() => getInitialRegion());
  const [challengePerfs, setChallengePerfs] = useState<ChallengePerformance[]>([]);
  const [nextPerfs, setNextPerfs] = useState<ChallengePerformance[]>([]);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [loadingNext, setLoadingNext] = useState(true);

  const [reviewStates, setReviewStates] = useState<Record<string, ReviewStatus>>(() => loadReviewStates());
  const [activeModal, setActiveModal] = useState<ChallengePerformance | null>(null);

  const [character, setCharacter] = useState<CharacterProgress>(() => getCharacterProgress());
  const [evolution, setEvolution] = useState<{
    previous: CharacterProgress;
    progress: CharacterProgress;
  } | null>(null);
  const [xpBoosted, setXpBoosted] = useState(false);

  const updateReviewState = useCallback((id: string, status: ReviewStatus) => {
    setReviewStates((prev) => {
      const next = { ...prev, [id]: status };
      saveReviewStates(next);
      return next;
    });
  }, []);

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
      .catch(() => { if (!ac.signal.aborted) setLoadingChallenge(false); });
    return () => ac.abort();
  }, [selectedRegion]);

  /* 다음 달 보상 공연 로드 (1회) */
  useEffect(() => {
    const ac = new AbortController();
    getNextMonthRewardPerformances("전체", ac.signal)
      .then((data) => {
        if (!ac.signal.aborted) {
          setNextPerfs(filterRewardSelectablePerformances(data));
          setLoadingNext(false);
        }
      })
      .catch(() => { if (!ac.signal.aborted) setLoadingNext(false); });
    return () => ac.abort();
  }, []);

  /* 리뷰 제출 */
  const handleReviewSubmit = useCallback(async (data: ReviewData) => {
    if (!activeModal) return;
    const id = activeModal.id;
    setActiveModal(null);
    updateReviewState(id, "pending");

    await submitReviewChallenge(id, data);

    updateReviewState(id, "approved");
  }, [activeModal, updateReviewState]);

  /* 보상 받기 클릭 */
  const handleClaimReward = (id: string) => {
    updateReviewState(id, "rewarded");

    const result = grantCharacterXp(REWARD_XP, `review:${id}`);
    setCharacter(result.progress);

    if (!result.duplicated) {
      setXpBoosted(true);
      window.setTimeout(() => setXpBoosted(false), 1000);
    }
    if (result.didLevelUp) {
      setEvolution({ previous: result.previous, progress: result.progress });
    }
  };

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

      {/* ── 리뷰 모달 ────────────────────────────── */}
      {activeModal && (
        <ReviewModal
          performance={activeModal}
          onSubmit={handleReviewSubmit}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* ── 히어로 ───────────────────────────────── */}
      <section className="rc-hero">
        <div className="rc-hero-badge">챌린지 진행 중</div>
        <h1 className="rc-hero-title">5월 리뷰 챌린지</h1>
        <p className="rc-hero-desc">
          지역별 숨은 공연을 발견하고 리뷰를 남겨보세요.
          리뷰 인증 완료 시 XP와 배지를 받고,
          추첨을 통해 다음 달 공연 티켓을 직접 선택할 수 있습니다.
        </p>
        <div className="rc-hero-rewards">
          <span className="rc-hero-reward"><span>✨</span>+{REWARD_XP} XP</span>
          <span className="rc-hero-reward"><span>🏅</span>리뷰어 배지</span>
          <span className="rc-hero-reward"><span>🎟</span>티켓 선택권 추첨</span>
        </div>
        <button
          className="rc-hero-cta"
          onClick={() => challengePerfs[0] && setActiveModal(challengePerfs[0])}
          disabled={challengePerfs.length === 0}
        >
          리뷰 쓰고 참여하기
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
                    const status = reviewStates[perf.id] ?? "idle";
                    return (
                      <PerfCard
                        key={perf.id}
                        perf={perf}
                        status={status}
                        onReview={() => setActiveModal(perf)}
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
              onClick={() => challengePerfs[0] && setActiveModal(challengePerfs[0])}
              disabled={challengePerfs.length === 0}
            >
              리뷰 쓰고 참여하기
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
          onClick={() => challengePerfs[0] && setActiveModal(challengePerfs[0])}
          disabled={challengePerfs.length === 0}
        >
          리뷰 쓰고 참여하기
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
  perf, status, onReview, onClaim,
}: {
  perf: ChallengePerformance;
  status: ReviewStatus;
  onReview: () => void;
  onClaim: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);

  const handleBtnClick = () => {
    if (status === "idle")     onReview();
    if (status === "approved") onClaim();
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
          <span className="rc-challenge-tag">챌린지 참여 가능</span>
          <button
            className={`rc-review-btn ${status}`}
            onClick={handleBtnClick}
            disabled={status === "pending" || status === "rewarded"}
          >
            {reviewBtnLabel(status)}
          </button>
        </div>
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
