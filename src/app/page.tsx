"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ProcessedShow, ShowsPayload } from "@/types/show";
import { getUserPrefs, setUserPrefs } from "@/lib/userPrefs";
import type { UserPrefs } from "@/lib/userPrefs";
import type { Venue, PersonalizedLC } from "@/lib/kopis";
import { PosterCard } from "@/components/home/PosterCard";
import { GenreEditSheet } from "@/components/home/GenreEditSheet";
import { RegionEditSheet } from "@/components/home/RegionEditSheet";
import { VenueChips } from "@/components/filter/VenueChips";

// ─── Icons ───────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
// ─── Constants ───────────────────────────────────────────────────────────────

const AREAS = ["서울", "경기", "부산", "대구", "인천", "광주", "대전", "울산"];

const GENRE_EMOJI: Record<string, string> = {
  뮤지컬: "🎭", 연극: "🎪", 재즈: "🎷", 클래식: "🎻",
  인디음악: "🎸", 무용: "💃", 전통예술: "🪷",
};

const EVENTS = [
  {
    id: "e1", icon: "🎟", title: "관람 인증 이벤트",
    desc: "봤으면 인증하세요, 경험치가 쌓입니다",
    reward: "+50 XP", rewardSub: "뱃지 「이달의 관람러」 획득",
    hint: "Lv.10 이상 → 우선 예매 혜택", cta: "인증하러 가기",
    gradBg: "linear-gradient(135deg, #1a1000 0%, #0f0800 55%, #0c0c0c 100%)",
    accentColor: "#fbbf24", accentBg: "rgba(251,191,36,0.12)", accentBorder: "rgba(251,191,36,0.35)",
  },
  {
    id: "e2", icon: "✍️", title: "5월 리뷰 챌린지",
    desc: "감상평 한 줄이 누군가의 공연을 결정합니다",
    reward: "티켓 2매 추첨", rewardSub: "리뷰 작성 → 6월 공연 당첨",
    hint: "지금까지 312개의 리뷰", cta: "리뷰 남기기",
    gradBg: "linear-gradient(135deg, #001a08 0%, #000e04 55%, #0c0c0c 100%)",
    accentColor: "#34d399", accentBg: "rgba(52,211,153,0.12)", accentBorder: "rgba(52,211,153,0.35)",
  },
];

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  label, icon, redDot, sub, href,
}: {
  label: string; icon?: string; redDot?: boolean; sub?: string; href?: string;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {redDot && (
          <span className="dday-urgent inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
        )}
        {icon && <span className="text-sm leading-none">{icon}</span>}
        <div>
          <span
            className={`font-bold text-white/90 ${
              redDot
                ? "text-[12px] tracking-[0.22em] uppercase"
                : "text-[15px] tracking-[0.04em]"
            }`}
          >
            {label}
          </span>
          {sub && (
            <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {sub}
            </p>
          )}
        </div>
      </div>
      {href && (
        <button
          onClick={() => router.push(href)}
          className="text-[11px] text-white/30 hover:text-white/55 transition-colors"
        >
          전체보기 →
        </button>
      )}
    </div>
  );
}

// ─── Horizontal poster row ────────────────────────────────────────────────────

function PosterRow({
  shows, loading,
}: {
  shows: ProcessedShow[]; loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto px-5 pb-1 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 xl:grid-cols-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-none w-[160px] md:w-auto rounded-2xl animate-pulse bg-white/5"
            style={{ aspectRatio: "2 / 3" }}
          />
        ))}
        <div className="flex-none w-1 md:hidden" aria-hidden />
      </div>
    );
  }
  return (
    <div
      className="flex gap-3 overflow-x-auto px-5 pb-1 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 xl:grid-cols-5"
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      {shows.map((s) => (
        <div key={s.id} className="flex-none w-[160px] md:w-auto">
          <PosterCard show={s} />
        </div>
      ))}
      <div className="flex-none w-1 md:hidden" aria-hidden />
    </div>
  );
}

// ─── Personalized greeting ────────────────────────────────────────────────────

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors"
      style={{
        color: "rgba(255,255,255,0.35)",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
      }}
      aria-label={label}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span className="text-[10px]">편집</span>
    </button>
  );
}

function PersonalizedGreeting({
  prefs,
  onPrefsChange,
  selectedArea,
  onAreaChange,
}: {
  prefs: UserPrefs;
  onPrefsChange: (updated: UserPrefs) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
}) {
  const [genreSheetOpen,  setGenreSheetOpen]  = useState(false);
  const [regionSheetOpen, setRegionSheetOpen] = useState(false);
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "안녕하세요" : "좋은 저녁이에요";

  function handleRegionSave(area: string) {
    const updated: UserPrefs = { ...prefs, region: area };
    setUserPrefs(updated);
    onPrefsChange(updated);
    onAreaChange(area);
    setRegionSheetOpen(false);
  }

  return (
    <>
      <div className="px-5 pt-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-[11px] font-medium mb-2" style={{ color: "rgba(255,255,255,0.38)" }}>
          {greeting},{" "}
          <span style={{ color: "rgba(251,191,36,0.85)" }}>{prefs.name}님</span>
        </p>

        {/* 두 필터 행 */}
        <div className="flex flex-col gap-2">

          {/* ── 관심 장르 ── */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>관심 장르:</span>
            {prefs.genres.length > 0 ? (
              prefs.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}
                >
                  {g}
                </span>
              ))
            ) : (
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>전체</span>
            )}
            <EditButton onClick={() => setGenreSheetOpen(true)} label="관심 장르 수정" />
          </div>

          {/* ── 공연장 지역 ── */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>공연장:</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ color: "rgba(96,165,250,0.9)", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)" }}
            >
              📍 {selectedArea}
            </span>
            <EditButton onClick={() => setRegionSheetOpen(true)} label="공연장 지역 변경" />
          </div>

        </div>
      </div>

      {genreSheetOpen && (
        <GenreEditSheet
          prefs={prefs}
          onClose={() => setGenreSheetOpen(false)}
          onSave={(updated) => { onPrefsChange(updated); setGenreSheetOpen(false); }}
        />
      )}
      {regionSheetOpen && (
        <RegionEditSheet
          currentArea={selectedArea}
          onClose={() => setRegionSheetOpen(false)}
          onSave={handleRegionSave}
        />
      )}
    </>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ ev }: { ev: typeof EVENTS[0] }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.985] transition-transform"
      style={{ background: ev.gradBg, border: `1px solid ${ev.accentBorder}` }}
    >
      <div className="relative flex items-center gap-4 px-4 py-4">
        <div
          className="flex-none w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: ev.accentBg, border: `1px solid ${ev.accentBorder}` }}
        >
          {ev.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-[13px] leading-tight mb-0.5">{ev.title}</h3>
          <p className="text-[11px] leading-snug mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {ev.desc}
          </p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>{ev.hint}</p>
        </div>
        <div className="flex-none flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-[13px] font-black" style={{ color: ev.accentColor }}>
              {ev.reward}
            </p>
            <p className="text-[9px] leading-tight" style={{ color: `${ev.accentColor}88` }}>
              {ev.rewardSub}
            </p>
          </div>
          <button
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide whitespace-nowrap"
            style={{
              background: ev.accentBg,
              border: `1px solid ${ev.accentBorder}`,
              color: ev.accentColor,
            }}
          >
            {ev.cta} →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Map entry card ───────────────────────────────────────────────────────────

function MapEntryCard() {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => router.push("/map")}
        className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.985] transition-transform"
        style={{
          background: "linear-gradient(135deg, #06101e 0%, #030b18 55%, #0c0c14 100%)",
          border: "1px solid rgba(96,165,250,0.14)",
        }}
      >
        <div className="relative flex items-center gap-4 px-5 py-5">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 80% at 90% 50%, rgba(96,165,250,0.06) 0%, transparent 70%)",
            }}
          />
          <div
            className="relative flex-none flex items-center justify-center rounded-2xl"
            style={{
              width: 52,
              height: 52,
              background: "rgba(96,165,250,0.09)",
              border: "1px solid rgba(96,165,250,0.2)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(96,165,250,0.75)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[15px] font-black text-white">지도에서 찾기</p>
            </div>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.36)" }}
            >
              내 주변 공연장과 공연을 한눈에 확인해보세요
            </p>
          </div>
          <div className="relative flex-none" style={{ color: "rgba(96,165,250,0.3)" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </button>

    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="pt-17 pb-20 lg:pb-8">
      {[0, 1, 2].map((s) => (
        <div key={s} className="mt-8 px-5">
          <div className="h-4 w-28 rounded-full bg-white/6 animate-pulse mb-4" />
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2].map((c) => (
              <div
                key={c}
                className="flex-none rounded-2xl animate-pulse bg-white/5"
                style={{ width: 164, aspectRatio: "2 / 3" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [data, setData]           = useState<ShowsPayload | null>(null);
  const [loading, setLoading]     = useState(true);
  const [prefs, setPrefs]         = useState<UserPrefs | null>(() => getUserPrefs());
  const genresKey = prefs?.genres?.join(",") ?? "";
  const [selectedArea, setSelectedArea] = useState<string>(() => getUserPrefs()?.region ?? "서울");
  const [loadedArea, setLoadedArea]     = useState("서울");

  // nearbyLoading is derived: data is ready but the requested area hasn't loaded yet
  const nearbyLoading = !loading && data !== null && loadedArea !== selectedArea;

  // ── Venue filter ────────────────────────────────────────────────────────────
  const [venues, setVenues]                       = useState<Venue[]>([]);
  const [venuesLoadedFor, setVenuesLoadedFor]     = useState("");
  const venuesLoading                             = venuesLoadedFor !== selectedArea;

  const [selectedVenueId, setSelectedVenueId]     = useState<string | null>(null);
  const [selectedVenueName, setSelectedVenueName] = useState<string>("");

  const [venueShows, setVenueShows]                         = useState<ProcessedShow[]>([]);
  const [venueShowsLoadedFor, setVenueShowsLoadedFor]       = useState<string | null>(null);
  const venueShowsLoading = selectedVenueId !== null && venueShowsLoadedFor !== selectedVenueId;

  // ── Onboarding redirect ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!prefs?.onboarded) router.push("/onboarding");
  }, [prefs?.onboarded, router]);

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    const initGenres = getUserPrefs()?.genres?.join(",") ?? "";
    const qs = new URLSearchParams({ area: "서울" });
    if (initGenres) qs.set("genres", initGenres);
    fetch(`/api/shows?${qs.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: ShowsPayload) => { setData(d); setLoadedArea("서울"); setLoading(false); })
      .catch((err) => { if (err.name !== "AbortError") setLoading(false); });
    return () => ctrl.abort();
  }, []);

  // ── Nearby refresh when area changes ────────────────────────────────────────
  const isFirstArea = useRef(true);
  useEffect(() => {
    if (isFirstArea.current) { isFirstArea.current = false; return; }
    const ctrl = new AbortController();
    const qs = new URLSearchParams({ area: selectedArea });
    if (genresKey) qs.set("genres", genresKey);
    fetch(`/api/shows?${qs.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: ShowsPayload) => {
        setData((prev) => (prev ? { ...prev, nearby: d.nearby } : d));
        setLoadedArea(selectedArea);
      })
      .catch((err) => { if (err.name !== "AbortError") setLoadedArea(selectedArea); });
    return () => ctrl.abort();
  }, [selectedArea, genresKey]);

  // ── Genre-specific recommendations ─────────────────────────────────────────
  const [genreData, setGenreData]             = useState<Record<string, ProcessedShow[]>>({});
  const [loadedGenresKey, setLoadedGenresKey] = useState("");

  const genreLoading = genresKey !== "" && loadedGenresKey !== genresKey;

  // lcParams encodes all LC filter inputs as a URL query string.
  // Declared here so genresKey is already in scope.
  const lcParams = useMemo(() => {
    const p = new URLSearchParams({ area: selectedArea });
    if (selectedVenueId) { p.set("venue", selectedVenueId); p.set("venueName", selectedVenueName); }
    if (genresKey) p.set("genres", genresKey);
    return p.toString();
  }, [selectedArea, selectedVenueId, selectedVenueName, genresKey]);

  const [personalLC, setPersonalLC]   = useState<PersonalizedLC | null>(null);
  const [lcLoadedFor, setLcLoadedFor] = useState("");
  const lcLoading = !loading && lcLoadedFor !== lcParams;

  useEffect(() => {
    if (!genresKey) return;
    const ctrl = new AbortController();
    fetch(`/api/genre?genres=${encodeURIComponent(genresKey)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: Record<string, ProcessedShow[]>) => { setGenreData(d); setLoadedGenresKey(genresKey); })
      .catch((err) => { if (err.name !== "AbortError") setLoadedGenresKey(genresKey); });
    return () => ctrl.abort();
  }, [genresKey]);

  // ── Fetch venues when area changes ──────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/venues?area=${encodeURIComponent(selectedArea)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((v: Venue[]) => { setVenues(v); setVenuesLoadedFor(selectedArea); })
      .catch((err) => { if (err.name !== "AbortError") setVenuesLoadedFor(selectedArea); });
    return () => ctrl.abort();
  }, [selectedArea]);

  // ── Fetch venue-specific shows ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedVenueId) return;
    const ctrl = new AbortController();
    fetch(`/api/venue-shows?venue=${encodeURIComponent(selectedVenueId)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((shows: ProcessedShow[]) => { setVenueShows(shows); setVenueShowsLoadedFor(selectedVenueId); })
      .catch((err) => { if (err.name !== "AbortError") setVenueShowsLoadedFor(selectedVenueId); });
    return () => ctrl.abort();
  }, [selectedVenueId]);

  // ── Personalized Last Chance ─────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const ctrl = new AbortController();
    fetch(`/api/lc?${lcParams}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: PersonalizedLC) => { setPersonalLC(d); setLcLoadedFor(lcParams); })
      .catch((err) => { if (err.name !== "AbortError") setLcLoadedFor(lcParams); });
    return () => ctrl.abort();
  }, [lcParams, loading]);

  // ── Derived display values ───────────────────────────────────────────────────
  function handleAreaChange(area: string) {
    setSelectedArea(area);
    setSelectedVenueId(null);
    setSelectedVenueName("");
    setVenueShows([]);
    setVenueShowsLoadedFor(null);
  }

  const hero      = data?.lastChance?.[0];
  const lcRest    = data?.lastChance?.slice(1) ?? [];
  const lcShows   = (personalLC?.shows?.length ?? 0) > 0
    ? personalLC!.shows
    : [hero, ...lcRest].filter(Boolean) as ProcessedShow[];
  const lcLabel   = personalLC?.label;
  const showLC    = lcShows.length > 0 || lcLoading;

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0c0c] lg:ml-[240px]">

      {/* ── Fixed header ───────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 lg:left-[240px] z-40 flex items-center justify-between px-5 pt-5 pb-4 bg-[#0c0c0c]">
        <div className="flex items-center gap-2 lg:hidden">
          <span
            className="w-2 h-2 rounded-full bg-amber-400"
            style={{ boxShadow: "0 0 8px 2px rgba(251,191,36,0.45)" }}
            aria-hidden
          />
          <span className="text-[18px] font-black tracking-[0.22em] text-white select-none">
            SPOTLIGHT
          </span>
        </div>
        <div className="flex items-center gap-3">
          {data?.isMock && (
            <span
              className="text-[9px] font-bold tracking-widest px-2 py-1 rounded-full uppercase"
              style={{
                color: "rgba(251,191,36,0.7)",
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              DEMO
            </span>
          )}
          <button aria-label="알림" className="relative text-white/65 hover:text-white transition-colors">
            <BellIcon />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#0c0c0c]" />
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      {loading ? (
        <PageSkeleton />
      ) : (
        <main className="flex-1 pt-17 pb-20 lg:pb-8 overflow-y-auto">
          <div className="lg:max-w-6xl lg:mx-auto">

          {/* Personalised greeting */}
          {prefs?.onboarded && (
            <PersonalizedGreeting
              prefs={prefs}
              onPrefsChange={setPrefs}
              selectedArea={selectedArea}
              onAreaChange={handleAreaChange}
            />
          )}

          {/* ══ 관심 장르별 추천 ════════════════════════════════════════════ */}
          {genreLoading && (
            <section className="mt-5">
              <div className="px-5">
                <SectionHeader label={`${prefs!.name}님을 위한 추천`} icon="✦" sub="불러오는 중..." />
              </div>
              <PosterRow shows={[]} loading />
            </section>
          )}
          {!genreLoading && Object.entries(genreData).map(([label, shows]) => {
            // label may be "재즈 · 인디음악" when genres share the same KOPIS shcate code
            const firstGenre = label.split(" · ")[0];
            const emoji = GENRE_EMOJI[firstGenre] ?? "🎭";
            return (
              <section key={label} className="mt-5">
                <div className="px-5">
                  <SectionHeader
                    label={`${label} 추천`}
                    icon={emoji}
                    sub={`${prefs!.name}님 관심 장르`}
                  />
                </div>
                {shows.length > 0 ? (
                  <PosterRow shows={shows} />
                ) : (
                  <div className="px-5 py-8 flex flex-col items-center gap-2.5">
                    <span className="text-3xl leading-none">🎭</span>
                    <p className="text-[14px] text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                      막이 오르기 전, 아직 조용한 순간이에요
                    </p>
                    <p className="text-[12px] text-center" style={{ color: "rgba(255,255,255,0.16)" }}>
                      다른 무대에서는 이미 공연이 시작됐을지도 몰라요
                    </p>
                  </div>
                )}
              </section>
            );
          })}

          {/* ══ 인기 공연 ════════════════════════════════════════════════════ */}
          {data?.popular && data.popular.length > 0 && (
            <section className={Object.keys(genreData).length > 0 || genreLoading ? "mt-8" : "mt-5"}>
              <div className="px-5">
                <SectionHeader label="인기 공연" icon="🔥" href="/shows/popular" />
              </div>
              <PosterRow shows={data.popular} />
            </section>
          )}

          {/* ══ Last Chance (개인화) ═════════════════════════════════════════ */}
          {showLC && (
            <section className="mt-8">
              <div className="px-5">
                <SectionHeader label="Last Chance" redDot href="/shows/last-chance" sub={lcLabel} />
              </div>
              {lcLoading && !personalLC ? (
                <PosterRow shows={[]} loading />
              ) : (
                <PosterRow shows={lcShows} />
              )}
            </section>
          )}

          {/* ══ 지도에서 찾기 ════════════════════════════════════════════════ */}
          <section className="mt-8 px-5">
            <MapEntryCard />
          </section>

          {/* ══ 숨은 공연 발견 ═══════════════════════════════════════════════ */}
          {data?.hidden && data.hidden.length > 0 && (
            <section className="mt-8">
              <div className="px-5">
                <SectionHeader label="숨은 공연 발견" icon="✦" href="/shows/hidden" />
              </div>
              <PosterRow shows={data.hidden} />
            </section>
          )}

          {/* ══ 내 공연장 근처 추천 ══════════════════════════════════════════ */}
          <section className="mt-8">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none">📍</span>
                <div>
                  <span className="text-[15px] font-bold tracking-[0.04em] text-white/90">
                    {selectedVenueName
                      ? selectedVenueName
                      : prefs ? `${prefs.name}님 주변 공연` : "내 공연장 근처 추천"}
                  </span>
                  {selectedVenueName && (
                    <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {selectedArea} 공연장
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push("/shows/nearby")}
                className="text-[11px] text-white/30 hover:text-white/55 transition-colors"
              >
                전체보기 →
              </button>
            </div>

            {/* 지역 칩 */}
            <div
              className="flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-x-visible px-5 pb-2"
              style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            >
              {AREAS.map((area) => {
                const active = selectedArea === area;
                return (
                  <button
                    key={area}
                    onClick={() => handleAreaChange(area)}
                    className="flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all"
                    style={
                      active
                        ? { background: "rgba(255,255,255,0.9)", color: "#0c0c0c" }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.4)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }
                    }
                  >
                    {area}
                  </button>
                );
              })}
              <div className="flex-none w-1" aria-hidden />
            </div>

            {/* 공연장 칩 */}
            <VenueChips
              venues={venues}
              loading={venuesLoading}
              selectedId={selectedVenueId}
              onSelect={(id, name) => {
                setSelectedVenueId(id);
                setSelectedVenueName(name);
                setVenueShows([]);
                setVenueShowsLoadedFor(null);
              }}
            />

            {/* 공연 목록 */}
            {selectedVenueId !== null ? (
              venueShowsLoading ? (
                <PosterRow shows={[]} loading />
              ) : venueShows.length > 0 ? (
                <PosterRow shows={venueShows} />
              ) : (
                <div className="px-5 py-8 flex flex-col items-center gap-2.5">
                  <span className="text-3xl leading-none">🏛️</span>
                  <p className="text-[14px] text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                    현재 이 공연장에 예정된 공연이 없어요
                  </p>
                  <button
                    onClick={() => { setSelectedVenueId(null); setSelectedVenueName(""); }}
                    className="mt-1 px-4 py-1.5 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    전체 공연장으로 보기
                  </button>
                </div>
              )
            ) : nearbyLoading ? (
              <PosterRow shows={[]} loading />
            ) : data?.nearby && data.nearby.length > 0 ? (
              <PosterRow shows={data.nearby} />
            ) : (
              <p
                className="px-5 py-8 text-center text-[14px]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {selectedArea}에 공연 정보가 없습니다
              </p>
            )}
          </section>

          {/* ══ 이벤트 ══════════════════════════════════════════════════════ */}
          <section className="mt-8 px-5 pb-4">
            <SectionHeader label="이벤트" icon="🎁" />
            <div className="flex flex-col gap-3">
              {EVENTS.map((ev) => (
                <EventCard key={ev.id} ev={ev} />
              ))}
            </div>
          </section>

          </div>
        </main>
      )}

    </div>
  );
}
