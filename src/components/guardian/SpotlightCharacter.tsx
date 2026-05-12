"use client";

// ─────────────────────────────────────────────────────────────────────────────
// SpotlightCharacter.tsx
// SPOTLIGHT 요정 캐릭터 — 이미지 없이 SVG + CSS만으로 직접 그림
//
// [파츠 등장 조건]
//   1단계: 빛 구슬 (얼굴만 있는 공 형태)
//   2단계: 요정 몸체 + 오라 링 + 별빛
//   3단계: + 헤드셋
//   4단계: + 팔 + 손에 티켓
//   5단계: + 작은 날개 + 가슴 티켓 코어
//   6단계: + 보라색 망토
//   7단계: + 좌우 공연 카드
//   8단계: + 큰 날개 + 원형 스포트라이트
//   9단계: + 왕관 + 황금 별빛
//  10단계: 모든 파츠 + 전설 황금 발광
// ─────────────────────────────────────────────────────────────────────────────

import "./SpotlightCharacter.css";

interface CharStage {
  level: number;
  color: string;   // 주 발광 색상 (HEX)
  accent: string;  // 보조 색상 (HEX)
}

interface Props {
  stage: CharStage;
  isLocked: boolean; // true → 검은 실루엣 + ? 오버레이
}

export function SpotlightCharacter({ stage, isLocked }: Props) {
  const lv = stage.level;
  const gc = stage.color;
  const ac = stage.accent;

  // ── 단계별 파츠 표시 여부 ─────────────────────────────────────────────────
  const hasAura       = lv >= 2;
  const hasHeadset    = lv >= 3;
  const hasArms       = lv >= 4;
  const hasTicket     = lv >= 4;
  const hasTicketCore = lv >= 5;
  const hasSmallWings = lv >= 5 && lv < 8;
  const hasCape       = lv >= 6;
  const hasCards      = lv >= 7;
  const hasLargeWings = lv >= 8;
  const hasSpotlight  = lv >= 8;
  const hasCrown      = lv >= 9;
  const isLegendary   = lv === 10;

  // SVG 내부 ID 충돌 방지 접두사
  const id = `sc${lv}`;

  return (
    /* 래퍼: 인라인 스타일로 크기 확정 (CSS 파일 로드 실패에도 대응) */
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          SVG 캐릭터 본체
          width/height 속성 + style 모두 지정해 어떤 환경에서도 크기 보장
          ══════════════════════════════════════════════════════════════════════ */}
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
          maxWidth: "100%",
          maxHeight: "100%",
          /* 잠금: 검은 실루엣 처리 */
          filter: isLocked
            ? "brightness(0) saturate(0)"
            : lv === 1
              ? `drop-shadow(0 0 10px ${gc}88) drop-shadow(0 0 24px ${gc}44)`
              : lv === 10
                ? `drop-shadow(0 0 14px ${gc}cc) drop-shadow(0 0 32px ${gc}66)`
                : `drop-shadow(0 0 8px ${gc}66)`,
        }}
        className={`char-stage-${lv}`}
      >
        {/* ── SVG 정의: 그라디언트 & 필터 ── */}
        <defs>
          {/* 배경 오라: 중심 발광 → 투명 */}
          <radialGradient id={`${id}-aura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={gc} stopOpacity="0.42" />
            <stop offset="65%"  stopColor={ac} stopOpacity="0.15" />
            <stop offset="100%" stopColor={gc} stopOpacity="0" />
          </radialGradient>

          {/* 얼굴 피부: 따뜻한 아이보리 */}
          <radialGradient id={`${id}-head`} cx="38%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#fff9f0" />
            <stop offset="55%"  stopColor="#fce3be" />
            <stop offset="100%" stopColor="#efc090" />
          </radialGradient>

          {/* 몸통: 단계별 보라색 */}
          <radialGradient id={`${id}-body`} cx="38%" cy="28%" r="65%">
            <stop offset="0%"
              stopColor={
                lv >= 9 ? "#9030f0"
                : lv >= 6 ? "#5a10b0"
                : lv >= 3 ? "#440888"
                : "#300060"
              }
            />
            <stop offset="100%" stopColor="#0e0020" />
          </radialGradient>

          {/* 날개: glow → 투명 */}
          <linearGradient id={`${id}-wing`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"   stopColor={gc} stopOpacity="0.75" />
            <stop offset="50%"  stopColor={ac} stopOpacity="0.45" />
            <stop offset="100%" stopColor={gc} stopOpacity="0.08" />
          </linearGradient>

          {/* 왕관: 금색 */}
          <linearGradient id={`${id}-crown`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#FFF4AA" />
            <stop offset="45%"  stopColor="#FFD700" />
            <stop offset="100%" stopColor="#A07000" />
          </linearGradient>

          {/* 연한 발광 블러 */}
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* 강한 발광 블러 (왕관 전용) */}
          <filter id={`${id}-glow2`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ════════════════════════════════════════════════════════════════════
            ★ 1단계 전용: 빛 구슬 캐릭터
            ════════════════════════════════════════════════════════════════════ */}
        {lv === 1 && (
          <g>
            {/* 배경 후광 */}
            <circle cx="100" cy="120" r="70" fill={`url(#${id}-aura)`} />
            {/* 구슬 본체 */}
            <circle cx="100" cy="120" r="54" fill={`url(#${id}-head)`} />
            {/* 구슬 하이라이트 */}
            <ellipse cx="83" cy="101" rx="20" ry="14" fill="white" opacity="0.18" />
            <ellipse cx="118" cy="110" rx="8" ry="5" fill="white" opacity="0.08" />
            {/* 눈 */}
            <ellipse cx="85"  cy="118" rx="7.5" ry="8.5" fill="#1e1030" />
            <ellipse cx="115" cy="118" rx="7.5" ry="8.5" fill="#1e1030" />
            <circle cx="88"  cy="115" r="2.8" fill="white" />
            <circle cx="118" cy="115" r="2.8" fill="white" />
            <circle cx="85.5" cy="121" r="1.2" fill="white" opacity="0.5" />
            {/* 볼터치 */}
            <ellipse cx="69"  cy="128" rx="11" ry="7" fill="#ff9090" opacity="0.30" />
            <ellipse cx="131" cy="128" rx="11" ry="7" fill="#ff9090" opacity="0.30" />
            {/* 미소 */}
            <path d="M 87 134 Q 100 143 113 134"
              fill="none" stroke="#c07080" strokeWidth="2.2" strokeLinecap="round" />
            {/* 위 빛 점 */}
            <circle cx="100" cy="58" r="8" fill={gc} opacity="0.9" filter={`url(#${id}-glow)`} />
            <circle cx="100" cy="58" r="4.5" fill="white" opacity="0.9" />
            <circle cx="82"  cy="72" r="4.5" fill={gc} opacity="0.6" filter={`url(#${id}-glow)`} />
            <circle cx="118" cy="72" r="4.5" fill={gc} opacity="0.6" filter={`url(#${id}-glow)`} />
          </g>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ★ 2단계 이상: 요정 형태 (머리 + 몸통 분리)
            ════════════════════════════════════════════════════════════════════ */}
        {lv >= 2 && (
          <>
            {/* ── 8단계+: 원형 스포트라이트 배경 ── */}
            {hasSpotlight && (
              <>
                <circle cx="100" cy="126" r="94" fill={`url(#${id}-aura)`} />
                <circle cx="100" cy="126" r="86" fill="none" stroke={gc}  strokeWidth="1"   opacity="0.20" />
                <circle cx="100" cy="126" r="93" fill="none" stroke={ac}  strokeWidth="0.5" opacity="0.12" />
              </>
            )}

            {/* ── 2~7단계: 기본 오라 ── */}
            {hasAura && !hasSpotlight && (
              <>
                <circle cx="100" cy="126" r="80" fill={`url(#${id}-aura)`} />
                <circle cx="100" cy="126" r="74" fill="none" stroke={gc} strokeWidth="0.8" opacity="0.22" />
              </>
            )}

            {/* ── 8단계+: 큰 날개 ── */}
            {hasLargeWings && (
              <>
                <g className="char-wing-l" filter={`url(#${id}-glow)`}>
                  <path d="M 70 150 Q 8 94 22 40 Q 42 12 70 78 Q 76 116 72 150 Z"
                    fill={`url(#${id}-wing)`} opacity="0.88" />
                  <path d="M 70 147 Q 20 110 32 64 Q 44 44 68 88"
                    fill="none" stroke="white" strokeWidth="0.9" opacity="0.40" />
                  <path d="M 52 136 Q 26 106 34 74"
                    fill="none" stroke={gc} strokeWidth="0.6" opacity="0.30" />
                </g>
                <g className="char-wing-r" filter={`url(#${id}-glow)`}>
                  <path d="M 130 150 Q 192 94 178 40 Q 158 12 130 78 Q 124 116 128 150 Z"
                    fill={`url(#${id}-wing)`} opacity="0.88" />
                  <path d="M 130 147 Q 180 110 168 64 Q 156 44 132 88"
                    fill="none" stroke="white" strokeWidth="0.9" opacity="0.40" />
                  <path d="M 148 136 Q 174 106 166 74"
                    fill="none" stroke={gc} strokeWidth="0.6" opacity="0.30" />
                </g>
              </>
            )}

            {/* ── 5~7단계: 작은 날개 ── */}
            {hasSmallWings && (
              <>
                <g className="char-wing-l">
                  <path d="M 72 153 Q 30 132 38 102 Q 50 84 72 136 Z"
                    fill={`url(#${id}-wing)`} opacity="0.82" />
                  <path d="M 71 150 Q 36 136 44 110"
                    fill="none" stroke="white" strokeWidth="0.7" opacity="0.38" />
                </g>
                <g className="char-wing-r">
                  <path d="M 128 153 Q 170 132 162 102 Q 150 84 128 136 Z"
                    fill={`url(#${id}-wing)`} opacity="0.82" />
                  <path d="M 129 150 Q 164 136 156 110"
                    fill="none" stroke="white" strokeWidth="0.7" opacity="0.38" />
                </g>
              </>
            )}

            {/* ── 6단계+: 망토 ── */}
            {hasCape && (
              <>
                <path d="M 68 182 Q 100 245 132 182 L 140 228 Q 100 260 60 228 Z"
                  fill="#1c0042" opacity="0.95" />
                <path d="M 76 186 Q 100 238 124 186"
                  fill="none" stroke={gc} strokeWidth="0.9" opacity="0.30" />
                <circle cx="100" cy="184" r="5.5" fill={gc}    opacity="0.88" filter={`url(#${id}-glow)`} />
                <circle cx="100" cy="184" r="3"   fill="white" opacity="0.72" />
              </>
            )}

            {/* ── 7단계+: 공연 카드 ── */}
            {hasCards && (
              <>
                <g transform="translate(26, 140) rotate(-24)" className="char-card">
                  <rect x="-13" y="-18" width="26" height="36" rx="3"
                    fill="#07071c" stroke={gc} strokeWidth="0.9" />
                  <rect x="-9" y="-14" width="18" height="11" rx="1.5"
                    fill={gc} opacity="0.22" />
                  <line x1="-8" y1="2"  x2="8"  y2="2"  stroke={gc} strokeWidth="0.5" opacity="0.50" />
                  <line x1="-8" y1="6"  x2="5"  y2="6"  stroke={gc} strokeWidth="0.5" opacity="0.38" />
                  <line x1="-8" y1="10" x2="7"  y2="10" stroke={gc} strokeWidth="0.5" opacity="0.28" />
                </g>
                <g transform="translate(174, 140) rotate(24)" className="char-card">
                  <rect x="-13" y="-18" width="26" height="36" rx="3"
                    fill="#07071c" stroke={gc} strokeWidth="0.9" />
                  <rect x="-9" y="-14" width="18" height="11" rx="1.5"
                    fill={gc} opacity="0.22" />
                  <line x1="-8" y1="2"  x2="8"  y2="2"  stroke={gc} strokeWidth="0.5" opacity="0.50" />
                  <line x1="-8" y1="6"  x2="5"  y2="6"  stroke={gc} strokeWidth="0.5" opacity="0.38" />
                  <line x1="-8" y1="10" x2="7"  y2="10" stroke={gc} strokeWidth="0.5" opacity="0.28" />
                </g>
              </>
            )}

            {/* ── 몸통 ── */}
            <ellipse cx="100" cy="158" rx="30" ry="24" fill={`url(#${id}-body)`} />
            {/* V넥 의상선 */}
            <path d="M 82 150 Q 100 162 118 150"
              fill="none" stroke={gc} strokeWidth="1.2" opacity={lv >= 5 ? 0.68 : 0.25} />

            {/* 5단계+: 가슴 티켓 코어 */}
            {hasTicketCore && (
              <g filter={`url(#${id}-glow)`}>
                <ellipse cx="100" cy="156" rx="9" ry="7"   fill={gc}    opacity="0.88" />
                <ellipse cx="100" cy="156" rx="5" ry="3.8" fill="white" opacity="0.78" />
              </g>
            )}

            {/* ── 4단계+: 팔 ── */}
            {hasArms && (
              <>
                <path d="M 72 156 Q 56 170 60 186"
                  fill="none"
                  stroke={lv >= 8 ? "#5a10b0" : "#380060"}
                  strokeWidth="10" strokeLinecap="round" />
                <path d="M 128 156 Q 144 170 140 186"
                  fill="none"
                  stroke={lv >= 8 ? "#5a10b0" : "#380060"}
                  strokeWidth="10" strokeLinecap="round" />
              </>
            )}

            {/* ── 4단계+: 손에 티켓 ── */}
            {hasTicket && (
              <g transform="translate(148, 192) rotate(-20)">
                <rect x="-18" y="-12" width="36" height="24" rx="4"
                  fill="#030310" stroke="#FFD700" strokeWidth="1.5" />
                <circle cx="-18" cy="0" r="4.5" fill="#020208" />
                <circle cx="18"  cy="0" r="4.5" fill="#020208" />
                <line x1="-13" y1="0" x2="13" y2="0"
                  stroke="#FFD700" strokeWidth="0.7" strokeDasharray="2.5 2" opacity="0.82" />
                <text x="0" y="-3.5" textAnchor="middle"
                  style={{ fontSize: "5.5px", fontFamily: "Arial, sans-serif", fontWeight: "bold" }}
                  fill="#FFD700" opacity="0.90">TICKET</text>
                <text x="0" y="9" textAnchor="middle"
                  style={{ fontSize: "9px", fontFamily: "Arial, sans-serif" }}
                  fill="#FFD700">★</text>
              </g>
            )}

            {/* ── 3단계+: 헤드셋 이어패드 (머리보다 먼저 그려서 머리 아래에 깔림) ── */}
            {hasHeadset && (
              <>
                <circle cx="56"  cy="86" r="14" fill="#20203a" />
                <circle cx="56"  cy="86" r="10" fill="#12121e" />
                <circle cx="144" cy="86" r="14" fill="#20203a" />
                <circle cx="144" cy="86" r="10" fill="#12121e" />
                {lv >= 7 && (
                  <>
                    <circle cx="56"  cy="86" r="7" fill={gc} opacity="0.28" />
                    <circle cx="144" cy="86" r="7" fill={gc} opacity="0.28" />
                  </>
                )}
              </>
            )}

            {/* ── 머리 ── */}
            <circle cx="100" cy="82" r="42" fill={`url(#${id}-head)`} />
            {/* 하이라이트 */}
            <ellipse cx="86"  cy="66" rx="16" ry="12" fill="white" opacity="0.14" />
            <ellipse cx="116" cy="72" rx="7"  ry="5"  fill="white" opacity="0.06" />

            {/* 눈썹 */}
            <path d="M 79 74 Q 86 70 93 74"
              fill="none" stroke="#5a4060" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 107 74 Q 114 70 121 74"
              fill="none" stroke="#5a4060" strokeWidth="1.5" strokeLinecap="round" />

            {/* 눈 */}
            <ellipse cx="84"  cy="83" rx="7.5" ry="8.5" fill="#1a0e2e" />
            <ellipse cx="116" cy="83" rx="7.5" ry="8.5" fill="#1a0e2e" />
            <circle cx="87.5"  cy="80" r="2.8" fill="white" />
            <circle cx="119.5" cy="80" r="2.8" fill="white" />
            <circle cx="85"    cy="86" r="1.2" fill="white" opacity="0.52" />
            <circle cx="117"   cy="86" r="1.2" fill="white" opacity="0.52" />

            {/* 볼터치 */}
            <ellipse cx="69"  cy="93" rx="12" ry="7" fill="#ff9090" opacity="0.26" />
            <ellipse cx="131" cy="93" rx="12" ry="7" fill="#ff9090" opacity="0.26" />

            {/* 입 */}
            <path d="M 90 101 Q 100 110 110 101"
              fill="none" stroke="#c07080" strokeWidth="2" strokeLinecap="round" />

            {/* ── 3단계+: 헤드셋 밴드 (머리 위에 그려서 머리 앞에 보임) ── */}
            {hasHeadset && (
              <path d="M 57 85 Q 100 34 143 85"
                fill="none" stroke="#282838" strokeWidth="7" strokeLinecap="round" />
            )}

            {/* ── 9단계+: 왕관 ── */}
            {hasCrown && (
              <g className="char-crown" filter={`url(#${id}-glow2)`}>
                <path d="M 74 48 L 82 34 L 100 46 L 118 34 L 126 48 Z"
                  fill={`url(#${id}-crown)`} />
                <circle cx="82"  cy="36" r="4.5" fill="#FF6080" opacity="0.95" />
                <circle cx="100" cy="46" r="5.5" fill="#88EEFF" opacity="0.95" />
                <circle cx="118" cy="36" r="4.5" fill="#88FF90" opacity="0.95" />
                <path d="M 74 48 L 82 34 L 100 46 L 118 34 L 126 48"
                  fill="none" stroke="#FFF0AA" strokeWidth="1" opacity="0.72" />
              </g>
            )}

            {/* ── 2~8단계: 머리 위 작은 빛 구슬 (왕관 전 단계) ── */}
            {lv >= 2 && !hasCrown && (
              <g filter={`url(#${id}-glow)`}>
                <circle cx="100" cy="34" r="5.5" fill={gc}    opacity="0.90" />
                <circle cx="100" cy="34" r="2.5" fill="white" opacity="0.90" />
              </g>
            )}

            {/* ── 2단계+: 별빛 / 스파클 ── */}
            {hasAura && (
              <g className="char-sparkles"
                style={{ fontFamily: "Arial, sans-serif" }}>
                <text x="28"  y="62"  style={{ fontSize: "12px" }} fill={gc}      opacity="0.72">✦</text>
                <text x="162" y="66"  style={{ fontSize: "10px" }} fill={gc}      opacity="0.58">✦</text>

                {lv >= 4 && (
                  <>
                    <text x="20"  y="168" style={{ fontSize: "8px" }}  fill={gc}  opacity="0.48">★</text>
                    <text x="170" y="172" style={{ fontSize: "9px" }}  fill={gc}  opacity="0.52">★</text>
                  </>
                )}

                {lv >= 6 && (
                  <>
                    <text x="42"  y="234" style={{ fontSize: "10px" }} fill="#FFD700" opacity="0.62">✦</text>
                    <text x="150" y="238" style={{ fontSize: "8px" }}  fill="#FFD700" opacity="0.56">✦</text>
                  </>
                )}

                {lv >= 9 && (
                  <>
                    <text x="14"  y="112" style={{ fontSize: "14px" }} fill="#FFD700" opacity="0.88">★</text>
                    <text x="172" y="108" style={{ fontSize: "14px" }} fill="#FFD700" opacity="0.88">★</text>
                    <text x="56"  y="248" style={{ fontSize: "11px" }} fill="#FFD700" opacity="0.70">✦</text>
                    <text x="134" y="252" style={{ fontSize: "10px" }} fill="#FFD700" opacity="0.65">✦</text>
                  </>
                )}

                {isLegendary && (
                  <>
                    <text x="4"   y="84" style={{ fontSize: "10px" }} fill={ac}      opacity="0.78">✦</text>
                    <text x="186" y="80" style={{ fontSize: "10px" }} fill={ac}      opacity="0.78">✦</text>
                    <text x="30"  y="48" style={{ fontSize: "12px" }} fill="#FFD700" opacity="0.88">★</text>
                    <text x="158" y="46" style={{ fontSize: "12px" }} fill="#FFD700" opacity="0.88">★</text>
                  </>
                )}
              </g>
            )}

            {/* 10단계 전설: 외곽 링 */}
            {isLegendary && (
              <>
                <circle cx="100" cy="126" r="92" fill="none" stroke={gc} strokeWidth="1.5" opacity="0.14" />
                <circle cx="100" cy="126" r="78" fill="none" stroke={ac} strokeWidth="1"   opacity="0.10" />
              </>
            )}
          </>
        )}
      </svg>

      {/* ══════════════════════════════════════════════════════════════════════
          잠금 오버레이 — 실루엣 위에 ? 표시
          인라인 스타일로 위치 보장
          ══════════════════════════════════════════════════════════════════════ */}
      {isLocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            background: "rgba(0,0,0,0.55)",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          {/* shimmer */}
          <div className="char-lock-shimmer" />
          {/* ? 아이콘 */}
          <span
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: "4.5rem",
              fontWeight: 900,
              lineHeight: 1,
              color: "#1e1e32",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
              userSelect: "none",
            }}
          >
            ?
          </span>
          {/* 안내 문구 */}
          <p
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: "0.6rem",
              color: "#2a2a44",
              textAlign: "center",
              padding: "0 1.5rem",
              lineHeight: 1.4,
            }}
          >
            아직 공개되지 않은 단계
          </p>
        </div>
      )}
    </div>
  );
}
