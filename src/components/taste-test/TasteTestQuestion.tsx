"use client";

import type { TasteQuestion } from "@/lib/tasteTestService";

interface Props {
  question: TasteQuestion;
  questionNumber: number;
  total: number;
  progress: number;
  selectedIdx: 0 | 1 | null;
  onSelect: (idx: 0 | 1) => void;
}

export function TasteTestQuestion({
  question,
  questionNumber,
  total,
  progress,
  selectedIdx,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="px-6 lg:px-16 pt-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[12px] font-bold tracking-[0.14em]"
              style={{ color: "rgba(57,255,20,0.7)" }}
            >
              당신의 공연 취향을 분석중...
            </p>
            <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.28)" }}>
              {questionNumber} / {total}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-0.75 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #39ff14 0%, rgba(57,255,20,0.5) 100%)",
                boxShadow: "0 0 8px rgba(57,255,20,0.5)",
                transition: "width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-10">
        <div className="max-w-3xl mx-auto w-full">
          {/* Question */}
          <p
            className="text-[11px] font-black tracking-[0.18em] uppercase mb-3"
            style={{ color: "rgba(57,255,20,0.5)" }}
          >
            Q{questionNumber}.
          </p>
          <h2 className="text-[22px] lg:text-[30px] font-black text-white leading-[1.3] mb-10 lg:mb-12">
            {question.question}
          </h2>

          {/* Options — stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row gap-4">
            {question.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              const isDimmed = selectedIdx !== null && !isSelected;
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(idx as 0 | 1)}
                  disabled={selectedIdx !== null}
                  className={`text-left rounded-2xl px-5 py-5 lg:py-7 taste-option-card lg:flex-1${isSelected ? " selected" : ""}${isDimmed ? " dimmed" : ""}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-5">
                    {/* Label badge */}
                    <div
                      className="flex-none w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-[13px] lg:text-[15px] font-black transition-all"
                      style={
                        isSelected
                          ? { background: "#39ff14", color: "#0c0c0c" }
                          : {
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.38)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }
                      }
                    >
                      {idx === 0 ? "A" : "B"}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] lg:text-[17px] font-bold text-white leading-snug mb-1">
                        {opt.label}
                      </p>
                      <p className="text-[12px] lg:text-[13px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {opt.sub}
                      </p>
                    </div>

                    {/* Check (mobile only — desktop has the border glow) */}
                    {isSelected && (
                      <div
                        className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-[13px] lg:hidden"
                        style={{ background: "#39ff14", color: "#0c0c0c" }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom percent */}
      <div className="px-6 pb-10 text-center">
        <span className="text-[12px] font-bold" style={{ color: "rgba(57,255,20,0.45)" }}>
          {progress}% 완료
        </span>
      </div>
    </div>
  );
}
