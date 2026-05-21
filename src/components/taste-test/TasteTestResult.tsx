"use client";

import Image from "next/image";
import type { TasteTypeResult } from "@/lib/tasteTestService";
import type { ProcessedShow } from "@/types/show";

interface Props {
  result: TasteTypeResult;
  shows: ProcessedShow[];
  showsLoading: boolean;
  onGoHome: () => void;
  onRetake: () => void;
}

export function TasteTestResult({ result, shows, showsLoading, onGoHome, onRetake }: Props) {
  function handleShare() {
    const text = `나는 ${result.name} ${result.emoji}\n당신의 공연 취향도 테스트해보세요! | SPOTLIGHT`;
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      navigator.share({ text, url: window.location.origin }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert("클립보드에 복사했어요!")).catch(() => {});
    }
  }

  return (
    <div className="flex flex-col pb-28 lg:pb-16">

      {/* RESULT badge */}
      <div className="flex justify-center pt-10 pb-6 taste-reveal">
        <div
          className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-[0.18em] uppercase"
          style={{
            background: `${result.color}18`,
            border: `1px solid ${result.color}45`,
            color: result.color,
          }}
        >
          RESULT
        </div>
      </div>

      {/* ── Desktop: side-by-side | Mobile: stacked ── */}
      <div className="px-5 lg:px-16 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start max-w-6xl mx-auto w-full">

        {/* ── Left column: character card ── */}
        <div>
          {/* Character card */}
          <div
            className="rounded-3xl px-6 pt-7 pb-6 mb-5 taste-reveal taste-reveal-delay-1"
            style={{
              background: result.bgGradient,
              border: `1px solid ${result.color}22`,
              boxShadow: `0 0 48px ${result.color}12`,
            }}
          >
            <div className="text-center mb-5">
              <div className="text-[64px] lg:text-[80px] leading-none mb-4 inline-block">
                {result.emoji}
              </div>
              <p
                className="text-[11px] font-bold tracking-[0.16em] uppercase mb-2"
                style={{ color: `${result.color}cc` }}
              >
                당신의 공연 타입
              </p>
              <h2 className="text-[24px] lg:text-[30px] font-black text-white mb-2">
                {result.name}
              </h2>
              <p className="text-[13px] lg:text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                {result.description}
              </p>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {result.traits.map((t) => (
                <span
                  key={t}
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{
                    background: `${result.color}12`,
                    border: `1px solid ${result.color}30`,
                    color: result.color,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Message */}
            <div
              className="rounded-xl px-4 py-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[13px] leading-relaxed text-center" style={{ color: "rgba(255,255,255,0.7)" }}>
                &ldquo;{result.message}&rdquo;
              </p>
            </div>
          </div>

          {/* Mood tags */}
          <div className="mb-5 taste-reveal taste-reveal-delay-2">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: "rgba(255,255,255,0.25)" }}>
              관련 태그
            </p>
            <div className="flex flex-wrap gap-2">
              {result.moodTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full py-3.5 rounded-2xl text-[14px] font-bold mb-4 lg:mb-0 flex items-center justify-center gap-2 taste-reveal taste-reveal-delay-2"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            <span>결과 공유하기</span>
            <span className="text-[16px]">↗</span>
          </button>
        </div>

        {/* ── Right column: shows + action buttons ── */}
        <div className="taste-reveal taste-reveal-delay-3">
          <p
            className="text-[11px] font-bold tracking-[0.14em] uppercase mb-1 mt-2 lg:mt-0"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            맞춤 추천
          </p>
          <h3 className="text-[17px] lg:text-[20px] font-black text-white mb-4">
            {result.name}에게 딱 맞는 공연
          </h3>

          {showsLoading ? (
            <div className="flex justify-center py-16">
              <div className="flex gap-2 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: result.color,
                      animation: `tastePulse 1.1s ease-in-out ${i * 0.18}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : shows.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {shows.slice(0, 6).map((show) => (
                <div
                  key={show.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {show.posterUrl ? (
                    <div className="relative w-full aspect-3/4">
                      <Image
                        src={show.posterUrl}
                        alt={show.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 200px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full aspect-3/4 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <span className="text-4xl">{result.emoji}</span>
                    </div>
                  )}
                  <div className="px-3 py-2.5">
                    <p className="text-[12px] font-bold text-white leading-snug line-clamp-2">
                      {show.title}
                    </p>
                    {show.venue && (
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.33)" }}>
                        {show.venue}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl px-5 py-10 text-center mb-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="text-3xl mb-3">{result.emoji}</div>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                추천 가능한 공연이 아직 없어요
              </p>
              <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.18)" }}>
                홈에서 더 많은 공연을 탐험해보세요
              </p>
            </div>
          )}

          {/* Action buttons — inline on desktop */}
          <div className="hidden lg:flex flex-col gap-2.5">
            <button
              onClick={onGoHome}
              className="w-full py-4 rounded-2xl text-[16px] font-black"
              style={{
                background: "#39ff14",
                color: "#0c0c0c",
                boxShadow: "0 0 24px rgba(57,255,20,0.3)",
              }}
            >
              공연 탐험 시작하기 ✦
            </button>
            <button
              onClick={onRetake}
              className="w-full py-2.5 text-[13px] font-semibold"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              다시 테스트하기
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons — sticky bottom on mobile only */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-[#0c0c0c]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-col gap-2.5 max-w-md mx-auto">
          <button
            onClick={onGoHome}
            className="w-full py-4 rounded-2xl text-[16px] font-black"
            style={{
              background: "#39ff14",
              color: "#0c0c0c",
              boxShadow: "0 0 24px rgba(57,255,20,0.3)",
            }}
          >
            공연 탐험 시작하기 ✦
          </button>
          <button
            onClick={onRetake}
            className="w-full py-2.5 text-[13px] font-semibold"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    </div>
  );
}
