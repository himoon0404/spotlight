"use client";

const STATS = [
  { value: "8", label: "개의 질문" },
  { value: "4", label: "가지 타입" },
  { value: "∞", label: "가지 추천" },
];

const TYPE_PREVIEWS = [
  { emoji: "🎭", name: "감성 스토리 탐험가" },
  { emoji: "⚡", name: "도파민 퍼포머" },
  { emoji: "🌙", name: "야간 감성 힐러" },
  { emoji: "🎟", name: "트렌드 컬렉터" },
];

interface Props {
  onStart: () => void;
  onSkip: () => void;
}

export function TasteTestWelcome({ onStart, onSkip }: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">

      {/* Logo bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center gap-2 px-7 lg:px-12 pt-10 pb-6">
        <span
          className="w-2 h-2 rounded-full flex-none"
          style={{ background: "#39ff14", boxShadow: "0 0 10px 4px rgba(57,255,20,0.4)" }}
        />
        <span className="text-[15px] font-black tracking-[0.28em] text-white">SPOTLIGHT</span>
      </div>

      {/* Main layout — 화면 중앙 정렬, max-width 제한 */}
      <div className="flex-1 flex items-center justify-center px-7 lg:px-12 pb-10 lg:pb-14">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* ── Left: hero text ── */}
          <div className="flex-1 min-w-0 pt-4 lg:pt-0">
            <div className="text-[52px] lg:text-[64px] leading-none mb-5">🎭</div>

            <p
              className="text-[13px] font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "rgba(57,255,20,0.8)" }}
            >
              공연 취향 분석
            </p>
            <h1 className="text-[32px] lg:text-[42px] font-black leading-[1.15] text-white mb-5">
              환영해요,<br />공연 탐험가님!
            </h1>
            <p className="text-[16px] leading-relaxed" style={{ color: "rgba(255,255,255,0.52)" }}>
              당신의 공연 취향을 분석해서<br />
              딱 맞는 공연을 추천해드릴게요.
            </p>
            <p className="text-[13px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              약 1분 소요
            </p>

            {/* Stats row */}
            <div className="mt-8 lg:mt-10 flex gap-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-2xl py-4 flex flex-col items-center gap-1.5"
                  style={{
                    background: "rgba(57,255,20,0.05)",
                    border: "1px solid rgba(57,255,20,0.18)",
                  }}
                >
                  <span className="text-[22px] font-black" style={{ color: "#39ff14" }}>
                    {s.value}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.42)" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA — 모바일에서만 표시 */}
            <div className="flex flex-col gap-3 mt-8 lg:hidden">
              <button
                onClick={onStart}
                className="w-full py-4 rounded-2xl text-[16px] font-black tracking-wide"
                style={{
                  background: "#39ff14",
                  color: "#0c0c0c",
                  boxShadow: "0 0 24px rgba(57,255,20,0.35), 0 0 48px rgba(57,255,20,0.12)",
                }}
              >
                시작하기 ✦
              </button>
              <button
                onClick={onSkip}
                className="w-full py-3 text-[13px] font-semibold"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                나중에 하기
              </button>
            </div>
          </div>

          {/* ── Right: type list + CTA ── */}
          <div className="w-full lg:w-[380px] lg:flex-none mt-10 lg:mt-0">
            <p
              className="text-[12px] font-bold tracking-[0.14em] uppercase mb-3"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              4가지 탐험가 타입
            </p>

            <div className="flex flex-col gap-2.5">
              {TYPE_PREVIEWS.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-[20px] leading-none">{t.emoji}</span>
                  <span className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {t.name}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA — 데스크톱에서만 표시 */}
            <div className="hidden lg:flex flex-col gap-3 mt-8">
              <button
                onClick={onStart}
                className="w-full py-4 rounded-2xl text-[16px] font-black tracking-wide"
                style={{
                  background: "#39ff14",
                  color: "#0c0c0c",
                  boxShadow: "0 0 24px rgba(57,255,20,0.35), 0 0 48px rgba(57,255,20,0.12)",
                }}
              >
                시작하기 ✦
              </button>
              <button
                onClick={onSkip}
                className="w-full py-3 text-[14px] font-semibold"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                나중에 하기
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
