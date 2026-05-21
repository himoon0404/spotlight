"use client";

import { useState } from "react";

// ─── Rule-based content helpers ───────────────────────────────────────────────

function hashIndex(str: string, len: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % len;
}

// ─── Content data ─────────────────────────────────────────────────────────────

const CURATOR_COMMENTS: Record<string, string[]> = {
  뮤지컬: [
    "처음 뮤지컬을 보는 분도 부담 없이 즐길 수 있는 작품이에요.",
    "화려한 넘버와 감동적인 스토리가 하나로 어우러지는 무대예요.",
    "배우들의 열정적인 퍼포먼스가 공간을 꽉 채우는 작품입니다.",
    "웃음과 감동이 교차하며 관객을 끝까지 집중시키는 공연이에요.",
  ],
  연극: [
    "배우들의 섬세한 연기와 공간 활용이 인상적인 작품이에요.",
    "잔잔하지만 깊은 여운을 남기는 연극이에요.",
    "일상 속 이야기를 무대 위에 섬세하게 담아낸 작품입니다.",
    "짧은 러닝타임이지만 오랜 시간 생각하게 만드는 공연이에요.",
  ],
  클래식: [
    "잔잔한 분위기를 좋아한다면 만족도가 높을 공연이에요.",
    "공연장 특유의 울림이 클래식의 매력을 극대화하는 무대입니다.",
    "처음 클래식 공연을 접하는 분에게도 깊은 감동을 줄 수 있어요.",
    "선율 하나하나가 귓가에 오래 남는 특별한 경험을 선사해요.",
  ],
  재즈: [
    "무대 위 즉흥 연주가 매 공연을 새롭게 만드는 라이브예요.",
    "재즈를 처음 접하는 분도 쉽게 즐길 수 있는 구성이에요.",
    "공연장의 분위기와 음악이 하나로 어우러지는 특별한 밤이에요.",
  ],
  인디음악: [
    "개성 넘치는 사운드와 진솔한 가사가 매력적인 공연이에요.",
    "소규모 공연장의 친밀한 분위기가 아티스트와의 거리를 좁혀줍니다.",
    "일상을 노래로 담은 진심 어린 무대가 기다리고 있어요.",
  ],
  무용: [
    "몸으로 전달하는 이야기가 말 없이도 깊은 감동을 줍니다.",
    "현대무용의 경계를 넘나드는 창의적인 안무가 인상적인 공연이에요.",
    "무대 전체를 캔버스처럼 활용하는 역동적인 퍼포먼스예요.",
  ],
  전통예술: [
    "우리 고유의 미감과 현대적 해석이 조화롭게 담긴 무대예요.",
    "전통예술을 처음 보는 분도 자연스럽게 빠져드는 공연이에요.",
    "오래된 아름다움을 새로운 시각으로 재해석한 작품입니다.",
  ],
};

const AI_MOODS: Record<string, string[]> = {
  뮤지컬: ["에너지 넘치는", "감동적인", "화려한", "즐거운"],
  연극: ["사색적인", "잔잔한", "몰입감 있는", "여운이 깊은"],
  클래식: ["우아한", "서정적인", "고즈넉한", "감미로운"],
  재즈: ["열정적인", "자유로운", "감성적인", "즉흥적인"],
  인디음악: ["진솔한", "개성 있는", "따뜻한", "감성적인"],
  무용: ["역동적인", "시각적인", "예술적인", "몽환적인"],
  전통예술: ["고풍스러운", "섬세한", "우아한", "독특한"],
};

const AI_TARGETS: Record<string, string[][]> = {
  뮤지컬: [
    ["커플", "가족", "뮤지컬 입문자"],
    ["단체 관람", "뮤지컬 마니아"],
    ["혼자 관람", "첫 공연"],
  ],
  연극: [
    ["연극 마니아", "혼자 관람"],
    ["사색을 즐기는 분", "문학 팬"],
    ["조용한 저녁을 원하는 분"],
  ],
  클래식: [
    ["클래식 입문자", "데이트"],
    ["음악 감상 애호가"],
    ["고요한 시간이 필요한 분"],
  ],
  재즈: [
    ["재즈 팬", "감성 충전"],
    ["데이트", "혼자 관람"],
    ["자유로운 저녁을 원하는 분"],
  ],
  인디음악: [
    ["인디 팬", "음악 마니아"],
    ["감성 충전이 필요한 분"],
    ["아티스트 팬"],
  ],
  무용: [
    ["예술 애호가", "무용 입문자"],
    ["시각적 경험을 원하는 분"],
    ["현대예술 팬"],
  ],
  전통예술: [
    ["전통예술 팬", "문화 체험"],
    ["가족", "외국인 관광객"],
    ["한국 문화 탐구자"],
  ],
};

const AI_KEYWORDS: Record<string, string[][]> = {
  뮤지컬: [
    ["화려한 무대", "감동적인 넘버", "배우 열연"],
    ["웃음과 눈물", "스토리", "라이브 연주"],
    ["에너지", "앙상블", "피날레"],
  ],
  연극: [
    ["섬세한 연기", "대사", "공간 활용"],
    ["여운", "현실감", "인물 묘사"],
    ["미니멀", "집중력", "몰입"],
  ],
  클래식: [
    ["선율", "울림", "연주력"],
    ["서정성", "화음", "감동"],
    ["테크닉", "표현력", "앙상블"],
  ],
  재즈: [
    ["즉흥 연주", "리듬", "분위기"],
    ["스윙", "상호작용", "라이브"],
    ["솔로", "앙상블", "에너지"],
  ],
  인디음악: [
    ["가사", "사운드", "진솔함"],
    ["아날로그 감성", "친밀감", "라이브"],
    ["실험성", "개성", "공감"],
  ],
  무용: [
    ["안무", "신체 표현", "음악과의 조화"],
    ["시각적 아름다움", "에너지", "스토리텔링"],
    ["기술", "예술성", "공간 활용"],
  ],
  전통예술: [
    ["전통미", "현대적 해석", "완성도"],
    ["복식", "음악", "동작"],
    ["정통성", "예술성", "감동"],
  ],
};

const AI_WATCH_POINTS: Record<string, string> = {
  뮤지컬:
    "넘버가 흘러나오는 순간 무대가 살아 움직이는 것을 느껴보세요. 특히 앙상블 장면에서 배우들의 에너지에 주목해보세요.",
  연극:
    "배우의 눈빛과 작은 몸짓 하나하나에 집중해보세요. 대사 없이도 전달되는 감정이 이 공연의 핵심입니다.",
  클래식:
    "연주자들의 호흡이 맞아 떨어지는 순간, 공연장 전체에 퍼지는 울림을 온몸으로 느껴보세요.",
  재즈:
    "연주자들이 서로 주고받는 즉흥 연주에 집중하면 매번 다른 라이브의 매력을 경험할 수 있어요.",
  인디음악:
    "아티스트의 가사에 담긴 이야기에 귀 기울여보세요. 공연 중 아티스트가 나누는 말도 놓치지 마세요.",
  무용:
    "음악과 몸의 움직임이 하나로 합쳐지는 순간을 주목하세요. 표정과 시선도 중요한 표현 요소입니다.",
  전통예술:
    "전통의 형식 속에 담긴 현대적 해석을 찾아보세요. 복식과 소품 하나하나에도 깊은 의미가 있답니다.",
};

// ─── Emotion Tags ─────────────────────────────────────────────────────────────

const EMOTION_TAGS = [
  { label: "감동적", emoji: "😭" },
  { label: "즐거움", emoji: "😄" },
  { label: "몰입감", emoji: "🎯" },
  { label: "웃음", emoji: "😂" },
  { label: "설렘", emoji: "💓" },
  { label: "여운", emoji: "🌙" },
  { label: "화려함", emoji: "✨" },
  { label: "잔잔함", emoji: "🌿" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  id: string;
  genre: string;
}

export function CuratorSection({ id, genre }: Props) {
  const normalizedGenre = Object.keys(CURATOR_COMMENTS).find((k) => genre.includes(k)) ?? "연극";

  const commentList = CURATOR_COMMENTS[normalizedGenre] ?? CURATOR_COMMENTS["연극"];
  const comment = commentList[hashIndex(id, commentList.length)];

  const moodList = AI_MOODS[normalizedGenre] ?? ["감동적인"];
  const mood1 = moodList[hashIndex(id, moodList.length)];
  const mood2 = moodList[hashIndex(id + "2", moodList.length)];
  const moodText = mood1 === mood2 ? mood1 : `${mood1} · ${mood2}`;

  const targetList = AI_TARGETS[normalizedGenre] ?? [["관객 모두"]];
  const targets = targetList[hashIndex(id + "t", targetList.length)];

  const keywordList = AI_KEYWORDS[normalizedGenre] ?? [["다양한 장면"]];
  const keywords = keywordList[hashIndex(id + "k", keywordList.length)];

  const watchPoint =
    AI_WATCH_POINTS[normalizedGenre] ?? "무대 위 모든 순간에 집중해보세요.";

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag].slice(0, 3),
    );
  }

  function submitReview() {
    if (!reviewText.trim() && selectedTags.length === 0) return;
    try {
      const key = `spotlight_review_${id}`;
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      existing.push({
        text: reviewText.trim(),
        tags: selectedTags,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    setReviewSubmitted(true);
  }

  return (
    <>
      {/* ── 큐레이터 한줄평 ────────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2
          className="text-[12px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          큐레이터 추천
        </h2>
        <div
          className="rounded-2xl px-4 py-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(0,0,0,0) 100%)",
            border: "1px solid rgba(251,191,36,0.2)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-none w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.22)",
                color: "#fbbf24",
              }}
            >
              ✦
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: "rgba(251,191,36,0.6)" }}
              >
                큐레이터 한줄평
              </p>
              <p
                className="text-[14px] leading-relaxed font-medium"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                &ldquo;{comment}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI 공연 요약 ─────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2
            className="text-[12px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            AI 공연 요약
          </h2>
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
            style={{
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.2)",
              color: "rgba(96,165,250,0.7)",
            }}
          >
            Beta
          </span>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* 공연 분위기 */}
          <div
            className="flex items-start gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-base leading-none mt-0.5">🎭</span>
            <div>
              <p
                className="text-[10px] font-medium uppercase tracking-wide mb-0.5"
                style={{ color: "rgba(167,139,250,0.65)" }}
              >
                공연 분위기
              </p>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                {moodText} 공연
              </p>
            </div>
          </div>

          {/* 이런 분께 추천 */}
          <div
            className="flex items-start gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-base leading-none mt-0.5">👥</span>
            <div>
              <p
                className="text-[10px] font-medium uppercase tracking-wide mb-1.5"
                style={{ color: "rgba(52,211,153,0.65)" }}
              >
                이런 분께 추천해요
              </p>
              <div className="flex flex-wrap gap-1.5">
                {targets.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.2)",
                      color: "rgba(52,211,153,0.9)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 리뷰 기반 키워드 */}
          <div
            className="flex items-start gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-base leading-none mt-0.5">🔑</span>
            <div>
              <p
                className="text-[10px] font-medium uppercase tracking-wide mb-1.5"
                style={{ color: "rgba(96,165,250,0.65)" }}
              >
                리뷰 기반 키워드
              </p>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{
                      background: "rgba(96,165,250,0.07)",
                      border: "1px solid rgba(96,165,250,0.18)",
                      color: "rgba(96,165,250,0.9)",
                    }}
                  >
                    # {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 관람 포인트 */}
          <div className="flex items-start gap-3 px-4 py-3">
            <span className="text-base leading-none mt-0.5">👁️</span>
            <div>
              <p
                className="text-[10px] font-medium uppercase tracking-wide mb-1"
                style={{ color: "rgba(251,191,36,0.65)" }}
              >
                관람 포인트
              </p>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {watchPoint}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 리뷰 ──────────────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2
          className="text-[12px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          리뷰
        </h2>

        {/* AI 리뷰 요약 */}
        <div
          className="rounded-2xl px-4 py-3.5 mb-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm leading-none">🤖</span>
            <p
              className="text-[11px] font-semibold"
              style={{ color: "rgba(96,165,250,0.7)" }}
            >
              AI 리뷰 요약
            </p>
          </div>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            관람객들은{" "}
            <span style={{ color: "rgba(255,255,255,0.85)" }}>
              {keywords[0]}
            </span>
            에 대한 만족도가 높다고 평가했습니다. 특히 공연 후 오래 여운이
            남는다는 반응이 많았습니다.
          </p>
        </div>

        {/* 리뷰 입력 */}
        {reviewSubmitted ? (
          <div
            className="rounded-2xl px-4 py-4 text-center"
            style={{
              background: "rgba(52,211,153,0.06)",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            <p
              className="text-[15px] font-bold mb-1"
              style={{ color: "#34d399" }}
            >
              감사합니다! 🎭
            </p>
            <p
              className="text-[12px]"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              리뷰가 등록되었어요
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="px-4 pt-4 pb-2">
              <p
                className="text-[11px] font-medium mb-2.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                감정 태그 선택 (최대 3개)
              </p>
              <div className="flex flex-wrap gap-2">
                {EMOTION_TAGS.map(({ label, emoji }) => {
                  const active = selectedTags.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleTag(label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-95"
                      style={
                        active
                          ? {
                              background: "rgba(251,191,36,0.12)",
                              border: "1px solid rgba(251,191,36,0.35)",
                              color: "#fbbf24",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.45)",
                            }
                      }
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 pb-2">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="공연에 대한 한줄 감상을 남겨주세요..."
                maxLength={100}
                rows={2}
                className="w-full bg-transparent text-[13px] resize-none outline-none mt-2"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  caretColor: "rgba(251,191,36,0.8)",
                }}
              />
            </div>

            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-[11px]"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {reviewText.length}/100
              </span>
              <button
                onClick={submitReview}
                disabled={!reviewText.trim() && selectedTags.length === 0}
                className="px-4 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 disabled:opacity-35"
                style={{
                  background: "rgba(251,191,36,0.14)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  color: "#fbbf24",
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
