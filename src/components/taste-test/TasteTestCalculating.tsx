"use client";

const MESSAGES = [
  "답변을 분석하는 중...",
  "공연 성향을 파악하는 중...",
  "딱 맞는 타입을 찾는 중...",
];

export function TasteTestCalculating() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-8 lg:px-16">
      <div className="text-center w-full max-w-sm lg:max-w-md">
        <div
          className="text-[72px] lg:text-[88px] leading-none mb-8 inline-block"
          style={{ animation: "tastePulse 1.4s ease-in-out infinite" }}
        >
          🔍
        </div>

        <p className="text-[18px] lg:text-[22px] font-black text-white mb-2">
          취향 분석중...
        </p>
        <p className="text-[13px] lg:text-[15px] mb-10" style={{ color: "rgba(255,255,255,0.38)" }}>
          당신만의 공연 타입을 찾고 있어요
        </p>

        <div className="flex flex-col gap-2.5 mb-10 text-left">
          {MESSAGES.map((msg, i) => (
            <div
              key={msg}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(57,255,20,0.04)",
                border: "1px solid rgba(57,255,20,0.12)",
                animation: `tasteReveal 0.4s ease ${i * 0.15}s forwards`,
                opacity: 0,
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-none"
                style={{
                  background: "#39ff14",
                  animation: `tastePulse 1.2s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
              <span className="text-[13px] lg:text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {msg}
              </span>
            </div>
          ))}
        </div>

        <div
          className="w-full h-0.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #39ff14, rgba(57,255,20,0.4))",
              boxShadow: "0 0 8px rgba(57,255,20,0.6)",
              animation: "tasteScanning 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
}
