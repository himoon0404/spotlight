"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserPrefs, setUserPrefs } from "@/lib/userPrefs";
import type { UserPrefs, NotificationPrefs } from "@/lib/userPrefs";
import { getFavorites } from "@/lib/favorites";
import { getTasteTypeById } from "@/lib/tasteTestService";

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRE_OPTIONS = ["뮤지컬", "연극", "클래식", "재즈", "대중음악", "무용", "국악", "서커스"];
const REGION_OPTIONS = ["서울", "경기", "부산", "대구", "인천", "광주", "대전", "울산", "강원", "제주"];

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  bookingOpen:   true,
  lastChance:    true,
  newArtistShow: true,
  nearbyShow:    false,
  moodRec:       true,
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-10 h-6 rounded-full transition-all flex-none"
      style={{
        background: on ? "rgba(251,191,36,0.85)" : "rgba(255,255,255,0.12)",
        border: on ? "none" : "1px solid rgba(255,255,255,0.15)",
      }}
      role="switch"
      aria-checked={on}
    >
      <span
        className="absolute top-1 transition-all rounded-full"
        style={{
          width: 16, height: 16,
          background: on ? "#0c0c0c" : "rgba(255,255,255,0.45)",
          left: on ? "calc(100% - 20px)" : 4,
        }}
      />
    </button>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="text-base leading-none">{icon}</span>
        <span className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.5)" }}>
          {title}
        </span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyPage() {
  const router   = useRouter();
  const [prefs,       setPrefsState] = useState<UserPrefs | null>(null);
  const [favCount,    setFavCount]   = useState(0);
  const [artistInput, setArtistInput] = useState("");
  const [saved,       setSaved]      = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = getUserPrefs();
    setPrefsState(p);
    setFavCount(getFavorites().length);
  }, []);

  if (!prefs) return null;

  const notifs: NotificationPrefs = prefs.notifications ?? DEFAULT_NOTIFICATIONS;
  const artists: string[]          = prefs.artists ?? [];

  function save(updated: UserPrefs) {
    setUserPrefs(updated);
    setPrefsState(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function toggleGenre(genre: string) {
    const genres = prefs!.genres.includes(genre)
      ? prefs!.genres.filter((g) => g !== genre)
      : [...prefs!.genres, genre];
    save({ ...prefs!, genres });
  }

  function toggleRegion(region: string) {
    save({ ...prefs!, region });
  }

  function addArtist() {
    const name = artistInput.trim();
    if (!name || artists.includes(name)) return;
    save({ ...prefs!, artists: [...artists, name] });
    setArtistInput("");
  }

  function removeArtist(name: string) {
    save({ ...prefs!, artists: artists.filter((a) => a !== name) });
  }

  function setNotif(key: keyof NotificationPrefs, val: boolean) {
    save({ ...prefs!, notifications: { ...notifs, [key]: val } });
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white lg:ml-[240px]">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-5 pt-5 pb-4 bg-[#0c0c0c]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="lg:max-w-2xl lg:mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-black text-white mb-0.5">마이페이지</h1>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.42)" }}>
              당신의 취향을 기억하는 공연 큐레이터
            </p>
          </div>
          {saved && (
            <span
              className="px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }}
            >
              저장됨 ✓
            </span>
          )}
        </div>
      </header>

      <main className="px-5 pt-5 pb-28 lg:pb-12 lg:max-w-2xl lg:mx-auto">

        {/* ── 프로필 카드 ── */}
        <div
          className="rounded-2xl px-5 py-5 mb-5 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, #1a1000 0%, #0f0800 55%, #0c0c0c 100%)",
            border: "1px solid rgba(251,191,36,0.18)",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-none text-2xl font-black"
            style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}
          >
            {prefs.name?.[0] ?? "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[20px] font-black text-white mb-1">{prefs.name}</p>
            {/* Taste type badge */}
            {prefs.tasteType && (() => {
              const tasteType = getTasteTypeById(prefs.tasteType!);
              return tasteType ? (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mb-1.5"
                  style={{
                    background: `${tasteType.color}15`,
                    border: `1px solid ${tasteType.color}35`,
                    color: tasteType.color,
                  }}
                >
                  <span>{tasteType.emoji}</span>
                  <span>{tasteType.name}</span>
                </div>
              ) : null;
            })()}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/wishlist")}
                className="flex items-center gap-1.5 transition-colors"
                style={{ color: "rgba(248,113,113,0.8)" }}
              >
                <HeartIcon />
                <span className="text-[12px] font-semibold">관심 {favCount}개</span>
              </button>
              <button
                onClick={() => router.push("/guardian")}
                className="text-[11px]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                캐릭터 보기 →
              </button>
            </div>
          </div>
        </div>

        {/* ── 관심 장르 ── */}
        <Section title="관심 장르" icon="🎭">
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => {
              const active = prefs.genres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                  style={
                    active
                      ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.42)", color: "#fbbf24" }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
                  }
                >
                  {g}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── 관심 지역 ── */}
        <Section title="관심 지역" icon="📍">
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map((r) => {
              const active = prefs.region === r;
              return (
                <button
                  key={r}
                  onClick={() => toggleRegion(r)}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                  style={
                    active
                      ? { background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.42)", color: "#60a5fa" }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
                  }
                >
                  {r}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── 관심 아티스트 ── */}
        <Section title="관심 아티스트" icon="⭐">
          <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            배우·가수·연주자·극단·오케스트라 등을 입력하면 새 공연 알림에 활용됩니다
          </p>

          {/* Input */}
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={artistInput}
              onChange={(e) => setArtistInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addArtist()}
              placeholder="예: 홍광호, 국립극단, 서울시향…"
              className="flex-1 rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: artistInput ? "1.5px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <button
              onClick={addArtist}
              disabled={!artistInput.trim()}
              className="px-4 rounded-xl text-[12px] font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: "rgba(251,191,36,0.12)",
                border: "1px solid rgba(251,191,36,0.35)",
                color: "#fbbf24",
              }}
            >
              추가
            </button>
          </div>

          {/* Tags */}
          {artists.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {artists.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full"
                  style={{
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.25)",
                  }}
                >
                  <span className="text-[12px] font-semibold" style={{ color: "rgba(167,139,250,0.9)" }}>
                    {name}
                  </span>
                  <button
                    onClick={() => removeArtist(name)}
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(167,139,250,0.2)", color: "rgba(167,139,250,0.7)" }}
                    aria-label={`${name} 삭제`}
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              아직 등록된 관심 아티스트가 없습니다
            </p>
          )}
        </Section>

        {/* ── 알림 설정 ── */}
        <Section title="알림 설정" icon="🔔">
          <p className="text-[11px] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            알림은 앱 업데이트 후 실제 발송될 예정입니다
          </p>
          {([
            { key: "bookingOpen",   label: "관심 공연 예매 오픈 알림" },
            { key: "lastChance",    label: "마감 임박 알림" },
            { key: "newArtistShow", label: "관심 아티스트 신규 공연 알림" },
            { key: "nearbyShow",    label: "관심 지역 공연 알림" },
            { key: "moodRec",       label: "감성 추천 알림" },
          ] as { key: keyof NotificationPrefs; label: string }[]).map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</span>
              <Toggle on={notifs[key]} onChange={(v) => setNotif(key, v)} />
            </div>
          ))}
        </Section>

        {/* ── 취향 분석 ── */}
        <Section title="취향 분석" icon="✦">
          {/* Taste test result card */}
          {(() => {
            const tasteType = prefs.tasteType ? getTasteTypeById(prefs.tasteType) : null;
            return tasteType ? (
              <div
                className="rounded-xl px-4 py-4 mb-3 flex items-center gap-4"
                style={{
                  background: tasteType.bgGradient,
                  border: `1px solid ${tasteType.color}22`,
                }}
              >
                <span className="text-3xl flex-none">{tasteType.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] mb-0.5" style={{ color: `${tasteType.color}aa` }}>나의 공연 타입</p>
                  <p className="text-[16px] font-black text-white">{tasteType.name}</p>
                  <p className="text-[12px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{tasteType.description}</p>
                </div>
              </div>
            ) : null;
          })()}

          <div
            className="rounded-xl px-4 py-4 flex flex-col gap-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            {prefs.genres.length > 0 ? (
              <>
                <div>
                  <p className="text-[12px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>선호 장르</p>
                  <p className="text-[15px] font-bold text-white">{prefs.genres.join(", ")}</p>
                </div>
                <div>
                  <p className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>주요 활동 지역</p>
                  <p className="text-[15px] font-bold text-white">{prefs.region || "전국"}</p>
                </div>
                {artists.length > 0 && (
                  <div>
                    <p className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>관심 아티스트</p>
                    <p className="text-[15px] font-bold text-white">{artists.slice(0, 3).join(", ")}{artists.length > 3 ? ` 외 ${artists.length - 3}명` : ""}</p>
                  </div>
                )}
                <p className="text-[12px] leading-relaxed mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>
                  관심 공연을 더 저장할수록 취향 분석이 정교해져요
                </p>
              </>
            ) : (
              <p className="text-[12px] text-center py-2" style={{ color: "rgba(255,255,255,0.28)" }}>
                관심 장르를 선택하면 취향 분석이 시작됩니다
              </p>
            )}
          </div>

          {/* Retake button */}
          <button
            onClick={() => router.push("/taste-test")}
            className="w-full mt-3 py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
            style={{
              background: "rgba(57,255,20,0.06)",
              border: "1px solid rgba(57,255,20,0.2)",
              color: "rgba(57,255,20,0.8)",
            }}
          >
            <span>{prefs.hasCompletedTasteTest ? "취향 다시 분석하기" : "공연 취향 테스트 하기"}</span>
            <span>→</span>
          </button>
        </Section>

        {/* ── 캐릭터 / 관람 기록 ── */}
        <button
          onClick={() => router.push("/guardian")}
          className="w-full rounded-2xl px-5 py-4 text-left flex items-center gap-4 transition-all active:scale-[0.985]"
          style={{
            background: "linear-gradient(135deg, #001a08 0%, #000e04 55%, #0c0c0c 100%)",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <div
            className="flex-none w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}
          >
            🎖️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-white mb-0.5">스포트라이트 캐릭터</p>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              관람 기록·성장 현황·뱃지 확인하기
            </p>
          </div>
          <div style={{ color: "rgba(52,211,153,0.4)" }}><ChevronIcon /></div>
        </button>

      </main>
    </div>
  );
}
