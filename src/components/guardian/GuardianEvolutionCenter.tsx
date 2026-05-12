"use client";

import { useEffect, useState } from "react";
import {
  getCharacterImageSrc,
  getCharacterProgress,
  type CharacterProgress,
} from "@/lib/characterProgress";
import { GUARDIAN_STAGES, getGuardianStage } from "@/lib/guardianStages";
import "./GuardianEvolution.css";

function stageProgressPercent(progress: CharacterProgress): number {
  return Math.min((progress.currentXp / progress.requiredXp) * 100, 100);
}

export function GuardianEvolutionCenter() {
  const [progress, setProgress] = useState<CharacterProgress>(() => getCharacterProgress());
  const [selected, setSelected] = useState(() => getCharacterProgress().level);
  const selectedStage = getGuardianStage(selected);
  const currentStage = getGuardianStage(progress.level);
  const isLocked = selected > progress.level;

  useEffect(() => {
    const onProgress = (event: Event) => {
      const next = (event as CustomEvent<CharacterProgress>).detail;
      setProgress(next);
      setSelected((prev) => Math.min(Math.max(prev, 1), next.level));
    };
    window.addEventListener("spotlight-character-progress", onProgress);
    return () => window.removeEventListener("spotlight-character-progress", onProgress);
  }, []);

  return (
    <div className="codex-page">
      <div className="codex-bg" aria-hidden />

      <main className="codex-shell">
        <header className="codex-header">
          <div>
            <p className="codex-kicker">SPOTLIGHT GUARDIAN</p>
            <h1 className="codex-title">캐릭터 진화 도감</h1>
            <p className="codex-desc">
              리뷰와 공연 경험으로 쌓은 XP가 캐릭터의 다음 무대를 엽니다.
            </p>
          </div>
          <div className="codex-current-badge">
            <span>현재 단계</span>
            <strong>Lv.{progress.level} · {currentStage.name}</strong>
          </div>
        </header>

        <section className="codex-hero">
          <div
            className={`codex-showcase${isLocked ? " locked" : ""}`}
            style={{
              "--stage-color": selectedStage.color,
              "--stage-soft": `${selectedStage.color}18`,
              "--stage-glow": `${selectedStage.color}44`,
            } as React.CSSProperties}
          >
            <div className="codex-spotlight" />
            <div className="codex-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCharacterImageSrc(selected)}
                alt={`${selectedStage.name} 캐릭터`}
                className="codex-character-img"
              />
              {isLocked && <div className="codex-lock-mask">LOCKED</div>}
            </div>
          </div>

          <div className="codex-detail">
            <div className="codex-detail-top">
              <span className="codex-level-pill">Lv.{selectedStage.level}</span>
              <span className={isLocked ? "codex-state locked" : "codex-state"}>
                {isLocked ? "잠김" : selected === progress.level ? "현재 단계" : "해금 완료"}
              </span>
            </div>
            <h2>{selectedStage.name}</h2>
            <p className="codex-stage-title">{selectedStage.title}</p>
            <p className="codex-stage-desc">
              {isLocked
                ? "아직 공개되지 않은 단계입니다. 리뷰와 공연 경험을 더 쌓으면 이 진화 기록이 열립니다."
                : selectedStage.description}
            </p>
            <div className="codex-items">
              {selectedStage.items.map((item) => (
                <span key={item} className={isLocked ? "locked" : ""}>{item}</span>
              ))}
            </div>

            <div className="codex-xp-panel">
              <div className="codex-xp-labels">
                <span>{progress.currentXp} XP</span>
                <span>{progress.requiredXp} XP</span>
              </div>
              <div className="codex-xp-track">
                <div className="codex-xp-fill" style={{ width: `${stageProgressPercent(progress)}%` }} />
              </div>
              <p>다음 진화까지 {Math.max(progress.requiredXp - progress.currentXp, 0)} XP</p>
            </div>
          </div>
        </section>

        <section className="codex-timeline-section">
          <div className="codex-section-head">
            <h2>진화 타임라인</h2>
            <p>단계를 눌러 해금 기록과 다음 목표를 확인하세요.</p>
          </div>

          <div className="codex-timeline">
            {GUARDIAN_STAGES.map((stage) => {
              const unlocked = stage.level <= progress.level;
              const active = stage.level === selected;
              return (
                <button
                  key={stage.level}
                  className={`codex-stage-node${active ? " active" : ""}${unlocked ? " unlocked" : " locked"}`}
                  onClick={() => setSelected(stage.level)}
                  style={{
                    "--stage-color": stage.color,
                    "--stage-soft": `${stage.color}18`,
                  } as React.CSSProperties}
                >
                  <span className="codex-node-dot">{unlocked ? stage.level : "🔒"}</span>
                  <span className="codex-node-copy">
                    <strong>{stage.name}</strong>
                    <small>{stage.title}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
