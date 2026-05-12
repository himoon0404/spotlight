"use client";

import { useState } from "react";
import {
  getCharacterProgress,
  grantCharacterXp,
  type CharacterProgress,
} from "@/lib/characterProgress";
import { CharacterEvolutionModal } from "@/components/guardian/CharacterEvolutionModal";
import { CharacterGrowthCard } from "@/components/guardian/CharacterGrowthCard";
import "./EventDetailPage.css";

/* ─── 타입 ─────────────────────────────────────── */
export interface EventConfig {
  id: string;
  title: string;
  desc: string;
  badgeLabel: string;
  heroBg: string;
  accentColor: string;
  accentBg: string;
  reward: {
    xp: number;
    badge?: string;
    special?: string;
    benefitNote?: string;
  };
  rewardItems: string[];
  steps: { step: number; label: string }[];
  notices: string[];
  ctaLabel: string;
  ctaDoneLabel: string;
}

interface Props {
  config: EventConfig;
}

const LEVEL_REWARDS = [
  { level: 5,  reward: "관심 장르 추천 강화" },
  { level: 10, reward: "우선 예매 알림 혜택" },
  { level: 15, reward: "리뷰 상단 노출권" },
  { level: 20, reward: "한정 배지 지급" },
];

/* ─── 컴포넌트 ─────────────────────────────────── */
export default function EventDetailPage({ config }: Props) {
  const [character, setCharacter] = useState<CharacterProgress>(() => getCharacterProgress());
  const [claimed, setClaimed] = useState(() =>
    getCharacterProgress().claimedRewardIds.includes(`event:${config.id}`)
  );
  const [evolution, setEvolution] = useState<{
    previous: CharacterProgress;
    progress: CharacterProgress;
  } | null>(null);
  const [xpBoosted, setXpBoosted] = useState(false);

  const addXp = () => {
    if (claimed) return;
    const result = grantCharacterXp(config.reward.xp, `event:${config.id}`);
    setCharacter(result.progress);
    if (!result.duplicated) {
      setXpBoosted(true);
      window.setTimeout(() => setXpBoosted(false), 1000);
    }
    if (result.didLevelUp) {
      setEvolution({ previous: result.previous, progress: result.progress });
    }
    setClaimed(true);
  };

  return (
    <div className="event-detail-page">

      {/* ── 진화 모달 ────────────────────────────── */}
      {evolution && (
        <CharacterEvolutionModal
          previous={evolution.previous}
          progress={evolution.progress}
          accentColor={config.accentColor}
          onClose={() => setEvolution(null)}
        />
      )}

      {/* ── 히어로 ─────────────────────────────────── */}
      <section className="event-hero" style={{ background: config.heroBg }}>
        <div
          className="event-hero-badge"
          style={{
            color: config.accentColor,
            background: config.accentBg,
            border: `1px solid ${config.accentColor}55`,
          }}
        >
          {config.badgeLabel}
        </div>
        <h1 className="event-hero-title" style={{
          backgroundImage: `linear-gradient(135deg, ${config.accentColor}, #64dcb4)`,
        }}>
          {config.title}
        </h1>
        <p className="event-hero-desc">{config.desc}</p>
        <div className="event-hero-rewards">
          {config.reward.xp > 0 && (
            <span className="event-hero-reward-item" style={{
              color: config.accentColor,
              background: config.accentBg,
              border: `1px solid ${config.accentColor}44`,
            }}>
              <span className="event-reward-icon">✨</span>
              +{config.reward.xp} XP
            </span>
          )}
          {config.reward.badge && (
            <span className="event-hero-reward-item" style={{
              color: config.accentColor,
              background: config.accentBg,
              border: `1px solid ${config.accentColor}44`,
            }}>
              <span className="event-reward-icon">🏅</span>
              {config.reward.badge} 배지
            </span>
          )}
          {config.reward.special && (
            <span className="event-hero-reward-item" style={{
              color: config.accentColor,
              background: config.accentBg,
              border: `1px solid ${config.accentColor}44`,
            }}>
              <span className="event-reward-icon">🎁</span>
              {config.reward.special}
            </span>
          )}
        </div>
        <button
          className="event-hero-cta"
          onClick={addXp}
          disabled={claimed}
          style={{
            background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}bb)`,
          }}
        >
          {claimed ? `${config.ctaDoneLabel}` : config.ctaLabel}
        </button>
      </section>

      <div className="event-content">

        {/* ── 캐릭터 성장 카드 ────────────────────── */}
        <CharacterGrowthCard
          progress={character}
          accentColor={config.accentColor}
          rewardXp={config.reward.xp}
          boosted={xpBoosted}
        />

        {/* ── 참여 방법 ────────────────────────────── */}
        <section className="participate-card">
          <h2 className="section-title">참여 방법</h2>
          <div className="steps-list">
            {config.steps.map(({ step, label }) => (
              <div key={step} className="step-item">
                <div
                  className="step-number"
                  style={{ background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}bb)` }}
                >
                  {step}
                </div>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 보상 안내 ────────────────────────────── */}
        <section className="reward-card">
          <h2 className="section-title">보상 안내</h2>
          <ul className="reward-list">
            {config.rewardItems.map((item, i) => (
              <li key={i} className="reward-list-item">
                <span className="reward-dot" style={{ background: config.accentColor }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 레벨 보상 리스트 ─────────────────────── */}
        <section className="level-rewards-card">
          <h2 className="section-title">레벨 보상</h2>
          <div className="level-rewards-list">
            {LEVEL_REWARDS.map(({ level, reward }) => (
              <div
                key={level}
                className={`level-reward-item${character.level >= level ? " achieved" : ""}`}
              >
                <span className="level-badge"
                  style={character.level >= level
                    ? { color: config.accentColor, background: `${config.accentColor}18`, border: `1px solid ${config.accentColor}33` }
                    : undefined
                  }
                >
                  Lv.{level}
                </span>
                <span className="level-reward-text">{reward}</span>
                {character.level >= level && (
                  <span className="level-check" style={{ color: config.accentColor }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 유의사항 ─────────────────────────────── */}
        <section className="notice-card">
          <h2 className="section-title notice-title">유의사항</h2>
          <ul className="notice-list">
            {config.notices.map((notice, i) => (
              <li key={i} className="notice-item">
                <span className="notice-dot" />
                {notice}
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* ── 하단 고정 CTA ────────────────────────── */}
      <div className="fixed-cta">
        <button
          className={`fixed-cta-btn${claimed ? " claimed" : ""}`}
          onClick={addXp}
          disabled={claimed}
          style={!claimed ? {
            background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}cc)`,
          } : undefined}
        >
          {claimed ? `${config.ctaDoneLabel} ✓` : config.ctaLabel}
        </button>
      </div>

    </div>
  );
}
