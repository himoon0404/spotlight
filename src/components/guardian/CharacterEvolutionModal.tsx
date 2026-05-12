"use client";

import type { CharacterProgress } from "@/lib/characterProgress";
import { getCharacterImageSrc } from "@/lib/characterProgress";
import { getGuardianStage } from "@/lib/guardianStages";
import "./CharacterGrowth.css";

interface Props {
  previous: CharacterProgress;
  progress: CharacterProgress;
  accentColor?: string;
  onClose: () => void;
}

export function CharacterEvolutionModal({
  previous,
  progress,
  accentColor = "#34d399",
  onClose,
}: Props) {
  const stage = getGuardianStage(progress.level);

  return (
    <div
      className="character-evolution-overlay"
      onClick={onClose}
      style={{
        "--character-accent": accentColor,
        "--character-accent-soft": `${accentColor}18`,
        "--character-accent-glow": `${accentColor}44`,
      } as React.CSSProperties}
    >
      <div className="character-evolution-modal" onClick={(e) => e.stopPropagation()}>
        <p className="character-evolution-label">Evolution Complete</p>
        <h2 className="character-evolution-title">캐릭터 진화!</h2>

        <div className="character-evolution-stage">
          <div className="character-evolution-portrait before">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getCharacterImageSrc(previous.level)} alt="진화 전 캐릭터" />
          </div>
          <span className="character-evolution-arrow">→</span>
          <div className="character-evolution-portrait after">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getCharacterImageSrc(progress.level)} alt="진화 후 캐릭터" />
          </div>
        </div>

        <div className="character-evolution-levels">
          <span>Lv.{previous.level}</span>
          <span>→</span>
          <span className="character-evolution-new">Lv.{progress.level}</span>
        </div>
        <p className="character-evolution-desc">
          {stage.name} 단계가 해금됐어요. 도감에서 새롭게 열린 진화 기록을 확인할 수 있습니다.
        </p>

        <button className="character-evolution-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
