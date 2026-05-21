"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProcessedShow, ShowsPayload, ShowTheme } from "@/types/show";
import { SearchModeSelector } from "@/components/search/SearchModeSelector";
import { KoreaMapSearch } from "@/components/search/KoreaMapSearch";
import { GenreSearch } from "@/components/search/GenreSearch";
import { PosterCard } from "@/components/home/PosterCard";
import { Pagination } from "@/components/Pagination";
import type { SearchMode } from "@/components/search/SearchModeSelector";
import { buildDetailUrl } from "@/app/shows/detail/[id]/page";
import { isMoodKeyword, assignMoodTags, matchesMoodKeyword, MOOD_BUTTON_LIST } from "@/lib/moodTags";

// ─── KOPIS 응답 → ProcessedShow 변환 ─────────────────────────────────────────

interface KopisItem {
  id: string;
  title: string;
  place: string;
  startDate: string;
  endDate: string;
  poster: string | null;
  genre: string;
  state: string;
  region: string;
}

const GENRE_THEME: Record<string, ShowTheme> = {
  "연극": "amber",
  "뮤지컬": "teal",
  "서양음악(클래식)": "blue",
  "한국음악(국악)": "emerald",
  "무용(발레)": "purple",
  "무용(현대무용)": "red",
  "무용(한국무용)": "purple",
  "대중음악": "amber",
};

function kopisItemToShow(item: KopisItem): ProcessedShow {
  return {
    id:        item.id,
    title:     item.title,
    genre:     item.genre,
    venue:     item.place,
    posterUrl: item.poster ?? undefined,
    theme:     GENRE_THEME[item.genre] ?? "teal",
    period:    `${item.startDate} – ${item.endDate}`,
    area:      item.region,
  };
}

// ─── 활성 모드 태그 ───────────────────────────────────────────────────────────

function ActiveModeTag({ mode, onClear }: { mode: SearchMode; onClear: () => void }) {
  const label = mode === "map" ? "🗺️ 지도 탐색" : "🎭 장르 탐색";
  return (
    <div
      className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full self-start"
      style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)" }}
    >
      <span className="text-[11px] font-bold" style={{ color: "#fbbf24" }}>{label}</span>
      <button
        onClick={onClear}
        className="flex items-center justify-center w-4 h-4 rounded-full"
        style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── 스켈레톤 ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl animate-pulse bg-white/5" style={{ aspectRatio: "2/3" }} />
  );
}

// ─── 감성 키워드 칩 ───────────────────────────────────────────────────────────

function MoodChips({ activeKeyword, onSelect }: { activeKeyword: string; onSelect: (kw: string) => void }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5"
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      {MOOD_BUTTON_LIST.map(({ label, keyword, emoji }) => {
        const active = activeKeyword === keyword;
        return (
          <button
            key={keyword}
            onClick={() => onSelect(active ? "" : keyword)}
            className="flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95"
            style={
              active
                ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.42)", color: "#fbbf24", whiteSpace: "nowrap" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }
            }
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
      <div className="flex-none w-1" aria-hidden />
    </div>
  );
}

// ─── Inner page (needs Suspense for useSearchParams) ─────────────────────────

function SearchInner() {
  const router        = useRouter();
  const searchParams  = useSearchParams();

  const [keyword,    setKeyword]    = useState(() => searchParams.get("keyword") ?? "");
  const [activeMode, setActiveMode] = useState<SearchMode | null>(null);

  // 키워드 검색 상태
  const [keywordShows,   setKeywordShows]   = useState<ProcessedShow[]>([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordPage,     setKeywordPage]     = useState(1);
  const [keywordTotal,    setKeywordTotal]    = useState(0);
  const [keywordTotalPages, setKeywordTotalPages] = useState(1);

  // 감성 검색 상태
  const [moodShows,   setMoodShows]   = useState<ProcessedShow[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);

  // 큐레이터 추천
  const [curatorShows,   setCuratorShows]   = useState<ProcessedShow[]>([]);
  const [curatorLoading, setCuratorLoading] = useState(true);

  // URL param에서 keyword 초기화
  useEffect(() => {
    const kw = searchParams.get("keyword");
    if (kw) setKeyword(kw);
  }, [searchParams]);

  // 큐레이터 추천 — 마운트 시 1회
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/shows?area=서울", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: ShowsPayload) => {
        const picks = [...(d.popular ?? []), ...(d.hidden ?? [])].slice(0, 4);
        setCuratorShows(picks);
        setCuratorLoading(false);
      })
      .catch((err) => { if (err.name !== "AbortError") setCuratorLoading(false); });
    return () => ctrl.abort();
  }, []);

  // 감성 키워드 검색 — 감성 키워드일 때 shows API에서 mood 필터
  useEffect(() => {
    const q = keyword.trim();
    if (!q || !isMoodKeyword(q)) { setMoodShows([]); return; }

    setMoodLoading(true);
    const ctrl = new AbortController();
    fetch("/api/shows?area=서울", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: ShowsPayload) => {
        const seen = new Set<string>();
        const all: ProcessedShow[] = [
          ...(d.popular ?? []),
          ...(d.hidden  ?? []),
          ...(d.nearby  ?? []),
          ...(d.lastChance ?? []),
        ].filter((show) => {
          if (seen.has(show.id)) return false;
          seen.add(show.id);
          return true;
        });
        const filtered = all.filter((show) => {
          const tags = assignMoodTags(show);
          return matchesMoodKeyword(tags, q);
        });
        setMoodShows(filtered.length > 0 ? filtered : all.slice(0, 6));
        setMoodLoading(false);
      })
      .catch((err) => { if (err.name !== "AbortError") setMoodLoading(false); });
    return () => ctrl.abort();
  }, [keyword]);

  // 키워드 바뀌면 페이지 초기화
  const prevKeywordRef = useRef("");
  useEffect(() => {
    const q = keyword.trim();
    if (prevKeywordRef.current !== q) {
      prevKeywordRef.current = q;
      setKeywordPage(1);
    }
  }, [keyword]);

  // 일반 키워드 검색 — 키워드 변경 시 300ms 디바운스, 페이지 변경 시 즉시
  useEffect(() => {
    const q = keyword.trim();
    if (!q || isMoodKeyword(q)) {
      setKeywordShows([]);
      setKeywordLoading(false);
      setKeywordTotal(0);
      setKeywordTotalPages(1);
      return;
    }

    setKeywordLoading(true);
    const ctrl = new AbortController();
    const isNewKeyword = prevKeywordRef.current !== q;
    const delay = isNewKeyword ? 300 : 0;
    const timer = setTimeout(() => {
      fetch(`/api/kopis?query=${encodeURIComponent(q)}&page=${keywordPage}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then(({ items = [], total = 0, totalPages: tp = 1 }: { items: KopisItem[]; total: number; totalPages: number }) => {
          setKeywordShows(items.map(kopisItemToShow));
          setKeywordTotal(total);
          setKeywordTotalPages(tp);
          setKeywordLoading(false);
        })
        .catch((err) => { if (err.name !== "AbortError") setKeywordLoading(false); });
    }, delay);

    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [keyword, keywordPage]);

  function handleModeSelect(mode: SearchMode) {
    setActiveMode((prev) => (prev === mode ? null : mode));
  }

  const q = keyword.trim();
  const isMoodMode    = q.length > 0 && isMoodKeyword(q);
  const isKeywordMode = q.length > 0 && !isMoodMode;

  return (
    <div className="min-h-screen lg:ml-60" style={{ background: "#0c0c0c", color: "#ffffff" }}>
      <div className="pb-28 lg:pb-8">

        {/* ── 검색창 ─────────────────────────────────────────────────────── */}
        <div className="pt-5 px-5 pb-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="공연명, 장르, 감성 키워드 검색 (예: 힐링, 데이트)"
              className="w-full rounded-2xl pl-11 pr-11 py-4 text-[14px] text-white placeholder:text-white/30 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: keyword ? "1.5px solid rgba(251,191,36,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}
            />
            {keyword && (
              <button onClick={() => setKeyword("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.42)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── 감성 키워드 칩 (항상 표시) ──────────────────────────────────── */}
        <div className="px-5 pb-5">
          <MoodChips activeKeyword={q} onSelect={(kw) => setKeyword(kw)} />
        </div>

        {/* ── 감성 검색 결과 ─────────────────────────────────────────────── */}
        {isMoodMode ? (
          <div className="px-5">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xl leading-none">✨</span>
              <span className="text-[17px] font-black text-white">"{q}" 감성 공연</span>
            </div>
            <p className="text-[12px] mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>
              분위기·장르·제목 키워드를 바탕으로 추천한 공연입니다
            </p>

            {moodLoading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : moodShows.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {moodShows.map((s) => (
                  <PosterCard key={s.id} show={s} onClick={() => router.push(buildDetailUrl(s))} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl py-10 text-center"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-3xl mb-3">🌙</p>
                <p className="text-[13px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  지금은 해당 감성의 공연이 없어요
                </p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>다른 키워드로 탐색해보세요</p>
              </div>
            )}
          </div>

        ) : isKeywordMode ? (
          /* ── 일반 키워드 결과 ──────────────────────────────────────────── */
          <div className="px-5">
            <div className="flex items-baseline gap-2.5 mb-5">
              <span className="text-[17px] font-black text-white">검색 결과</span>
              {!keywordLoading && keywordTotal > 0 && (
                <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.42)" }}>
                  총 {keywordTotal.toLocaleString()}개
                </span>
              )}
            </div>

            {keywordLoading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : keywordShows.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {keywordShows.map((s) => (
                    <PosterCard key={s.id} show={s} onClick={() => router.push(buildDetailUrl(s))} />
                  ))}
                </div>
                <Pagination
                  page={keywordPage}
                  totalPages={keywordTotalPages}
                  onChange={(p) => {
                    setKeywordPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </>
            ) : (
              <div className="rounded-2xl py-10 text-center"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-[13px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  조건에 맞는 공연이 없어요
                </p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>다른 키워드로 검색해보세요</p>
              </div>
            )}
          </div>

        ) : (
          <>
            {/* ── 타이틀 ────────────────────────────────────────────────── */}
            <div style={{
              maxHeight: activeMode ? "0px" : "88px",
              opacity:   activeMode ? 0 : 1,
              overflow: "hidden",
              transition: "max-height 0.3s ease, opacity 0.2s ease",
            }}>
              <div className="px-5 pb-5">
                <h1 className="text-[20px] font-black text-white mb-1.5">공연을 어떻게 찾고 싶나요?</h1>
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  지도에서 가까운 공연장을 찾거나,<br />장르별로 취향에 맞는 공연을 탐색해보세요.
                </p>
              </div>
            </div>

            {/* ── 모드 선택 ─────────────────────────────────────────────── */}
            <SearchModeSelector activeMode={activeMode} onSelect={handleModeSelect} />

            {/* ── 활성 모드 태그 ────────────────────────────────────────── */}
            {activeMode && (
              <div className="px-5 mt-4 mb-2">
                <ActiveModeTag mode={activeMode} onClear={() => setActiveMode(null)} />
              </div>
            )}

            <div className="mx-5 mt-3 mb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

            {/* ── 모드 콘텐츠 ───────────────────────────────────────────── */}
            <div style={{
              maxHeight: activeMode ? "6000px" : "0px",
              opacity:   activeMode ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.45s ease, opacity 0.3s ease 0.05s",
            }}>
              {activeMode === "map"   && <KoreaMapSearch keyword={keyword} />}
              {activeMode === "genre" && <GenreSearch    keyword={keyword} />}
            </div>

            {/* ── 큐레이터 추천 (모드 미선택 시) ───────────────────────── */}
            <div style={{
              maxHeight: activeMode ? "0px" : "2000px",
              opacity:   activeMode ? 0 : 1,
              overflow: "hidden",
              transition: "max-height 0.35s ease, opacity 0.2s ease",
            }}>
              <div className="px-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-base leading-none">✦</span>
                  <span className="text-[17px] font-black" style={{ color: "rgba(255,255,255,0.85)" }}>
                    큐레이터 추천 공연
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {curatorLoading
                    ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                    : curatorShows.map((s) => (
                        <PosterCard key={s.id} show={s} onClick={() => router.push(buildDetailUrl(s))} />
                      ))
                  }
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen lg:ml-60 bg-[#0c0c0c] px-5 pt-5">
        <div className="h-12 rounded-2xl bg-white/5 animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse bg-white/5" style={{ aspectRatio: "2/3" }} />
          ))}
        </div>
      </div>
    }>
      <SearchInner />
    </Suspense>
  );
}
