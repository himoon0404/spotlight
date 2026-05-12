"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CharacterProgress } from "@/lib/characterProgress";
import { getCharacterImageSrc } from "@/lib/characterProgress";
import "./CharacterGrowth.css";

interface Props {
  progress: CharacterProgress;
  accentColor?: string;
  title?: string;
  rewardXp?: number;
  boosted?: boolean;
  className?: string;
}

export function CharacterGrowthCard({
  progress,
  accentColor = "#34d399",
  title = "내 캐릭터 성장",
  rewardXp,
  boosted = false,
  className = "",
}: Props) {
  const [imgError, setImgError] = useState(false);
  const progressPercent = Math.min((progress.currentXp / progress.requiredXp) * 100, 100);
  const imageSrc = useMemo(() => getCharacterImageSrc(progress.level), [progress.level]);

  return (
    <section
      className={`character-growth-card${boosted ? " is-boosted" : ""}${className ? ` ${className}` : ""}`}
      style={{
        "--character-accent": accentColor,
        "--character-accent-soft": `${accentColor}18`,
        "--character-accent-glow": `${accentColor}44`,
      } as React.CSSProperties}
    >
      <div className="character-growth-header">
        <h2 className="character-growth-title">{title}</h2>
        <Link href="/guardian" className="character-codex-link">
          도감 보기
        </Link>
      </div>

      <div className="character-growth-body">
        <div className="character-portrait">
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={`${progress.title} 캐릭터`}
              className="character-portrait-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="character-portrait-fallback">🎭</span>
          )}
        </div>

        <div className="character-growth-info">
          <div className="character-level-row">
            <span className="character-level-text">Lv.{progress.level}</span>
            <span className="character-title-pill">{progress.title}</span>
          </div>

          <div className="character-xp-labels">
            <span>{progress.currentXp} XP</span>
            <span>{progress.requiredXp} XP</span>
          </div>
          <div className="character-xp-track">
            <div className="character-xp-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {typeof rewardXp === "number" && rewardXp > 0 && (
            <p className="character-xp-gain">
              이번 이벤트 참여 시{" "}
              <span className="character-xp-gain-value">+{rewardXp} XP</span> 획득
              <span className="character-xp-float">+{rewardXp} XP</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
