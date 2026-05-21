"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProcessedShow, ShowsPayload } from "@/types/show";
import { assignMoodTags, matchesMoodKeyword, CHATBOT_KEYWORD_MAP } from "@/lib/moodTags";
import { getFavorites } from "@/lib/favorites";
import { buildDetailUrl } from "@/app/shows/detail/[id]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "bot" | "user";
  text: string;
  shows?: ProcessedShow[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ─── Rule-based response engine ───────────────────────────────────────────────

function buildReply(
  input: string,
  allShows: ProcessedShow[],
  favoriteGenres: string[]
): { text: string; shows: ProcessedShow[] } {
  const lower = input.toLowerCase();

  // 관심 기반 추천
  if (lower.includes("관심") || lower.includes("취향") || lower.includes("내 기반")) {
    if (favoriteGenres.length > 0) {
      const matched = allShows.filter((s) =>
        favoriteGenres.some((g) => s.genre.includes(g) || g.includes(s.genre))
      ).slice(0, 4);
      return {
        text: `저장된 관심 장르(${favoriteGenres.slice(0, 2).join(", ")})를 기반으로 추천해드릴게요 🎭`,
        shows: matched,
      };
    }
    return {
      text: "관심 공연이나 장르를 먼저 저장하면 더 정확하게 추천해드릴 수 있어요! 하트 버튼을 눌러 저장해보세요.",
      shows: [],
    };
  }

  // 감성 키워드 매핑
  for (const [key, moodTags] of Object.entries(CHATBOT_KEYWORD_MAP)) {
    if (lower.includes(key)) {
      const matched = allShows.filter((s) => {
        const tags = assignMoodTags(s);
        return moodTags.some((m) => matchesMoodKeyword(tags, m));
      }).slice(0, 4);
      const label = moodTags[0];
      const text = matched.length > 0
        ? `"${key}" 분위기의 공연을 찾았어요! 취향에 맞으시길 바라요 ✨`
        : `"${key}" 키워드로 공연을 찾고 있어요. 지금 등록된 공연 중에서 가장 가까운 분위기로 추천드릴게요.`;
      return {
        text,
        shows: matched.length > 0 ? matched : allShows.slice(0, 3),
      };
    }
  }

  // 장르 직접 언급
  const genres = ["뮤지컬", "연극", "클래식", "재즈", "대중음악", "무용", "국악"];
  for (const g of genres) {
    if (lower.includes(g.toLowerCase())) {
      const matched = allShows.filter((s) => s.genre.includes(g)).slice(0, 4);
      return {
        text: `${g} 공연을 찾고 계시는군요! 지금 진행 중인 공연이에요 🎶`,
        shows: matched.length > 0 ? matched : allShows.slice(0, 3),
      };
    }
  }

  // 기본 응답
  return {
    text: "어떤 공연을 찾고 계신가요? 계절, 기분, 상황을 말씀해주시면 어울리는 공연을 추천해드릴게요 ✦",
    shows: allShows.slice(0, 3),
  };
}

// ─── Show chip ────────────────────────────────────────────────────────────────

const THEME_BG: Record<string, string> = {
  teal:    "linear-gradient(135deg, #0d2a2a, #041414)",
  emerald: "linear-gradient(135deg, #0d2818, #041208)",
  amber:   "linear-gradient(135deg, #251508, #120900)",
  blue:    "linear-gradient(135deg, #071830, #03091a)",
  purple:  "linear-gradient(135deg, #18082e, #0c0418)",
  red:     "linear-gradient(135deg, #3a0c0c, #1c0404)",
};

function ShowChip({ show, onClick }: { show: ProcessedShow; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all active:scale-[0.97] w-full"
      style={{
        background: THEME_BG[show.theme] ?? THEME_BG.teal,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {show.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={show.posterUrl} alt="" className="w-8 h-10 rounded-lg object-cover flex-none" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold truncate text-white">{show.title}</p>
        <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{show.venue}</p>
      </div>
    </button>
  );
}

// ─── Suggested questions ──────────────────────────────────────────────────────

const SUGGESTIONS = [
  "여름에 보기 좋은 공연 추천해줘",
  "힐링되는 공연 있어?",
  "데이트용 공연 추천해줘",
  "혼자 보기 좋은 공연 알려줘",
  "뮤지컬 추천해줘",
  "내 관심 공연 기준으로 추천해줘",
];

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export function AIChatbot() {
  const router  = useRouter();
  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [allShows,  setAllShows]  = useState<ProcessedShow[]>([]);
  const [loading,   setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 첫 오픈 시 공연 데이터 로드
  useEffect(() => {
    if (!open || allShows.length > 0) return;
    fetch("/api/shows?area=서울")
      .then((r) => r.json())
      .then((d: ShowsPayload) => {
        const all: ProcessedShow[] = [
          ...(d.popular     ?? []),
          ...(d.hidden      ?? []),
          ...(d.nearby      ?? []),
          ...(d.lastChance  ?? []),
        ];
        setAllShows(all);
      })
      .catch(() => {});
  }, [open, allShows.length]);

  // 첫 열기 시 웰컴 메시지
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "bot",
        text: "안녕하세요! 어떤 공연을 찾고 계신가요?\n계절, 분위기, 상황을 말해주시면 어울리는 공연을 추천해드릴게요.",
      }]);
    }
  }, [open, messages.length]);

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text: string) {
    const q = text.trim();
    if (!q) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    const favGenres = getFavorites().map((f) => f.genre);
    setTimeout(() => {
      const { text: replyText, shows } = buildReply(q, allShows, favGenres);
      setMessages((prev) => [...prev, { role: "bot", text: replyText, shows }]);
      setLoading(false);
    }, 600);
  }

  return (
    <>
      {/* ── 플로팅 버튼 ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-5 lg:bottom-8 z-[60] w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: open
            ? "rgba(251,191,36,0.95)"
            : "linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.95) 100%)",
          boxShadow: "0 4px 24px rgba(251,191,36,0.35), 0 2px 8px rgba(0,0,0,0.4)",
          color: "#0c0c0c",
        }}
        aria-label="AI 공연 추천 챗봇"
      >
        {open ? <CloseIcon /> : <SparkleIcon />}
      </button>

      {/* ── 채팅 패널 ───────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-[152px] right-5 lg:bottom-24 z-[59] w-[calc(100vw-40px)] max-w-sm rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            maxHeight: "70vh",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 flex-none"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-none"
              style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white">AI 공연 큐레이터</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                취향에 맞는 공연을 추천해드릴게요
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "" : "w-full"}`}>
                  <div
                    className="px-3 py-2.5 rounded-2xl text-[12px] leading-relaxed whitespace-pre-line"
                    style={
                      msg.role === "user"
                        ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)" }
                    }
                  >
                    {msg.text}
                  </div>
                  {/* Show cards */}
                  {msg.shows && msg.shows.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.shows.map((s) => (
                        <ShowChip
                          key={s.id}
                          show={s}
                          onClick={() => { router.push(buildDetailUrl(s)); setOpen(false); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2.5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          <div
            className="flex-none px-3 py-2 flex gap-2 overflow-x-auto"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="flex-none px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="flex-none flex gap-2 px-3 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="분위기, 계절, 상황을 입력해보세요…"
              className="flex-1 rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/25 outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: input ? "1px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-none transition-all active:scale-90 disabled:opacity-40"
              style={{ background: "rgba(251,191,36,0.85)", color: "#0c0c0c" }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
