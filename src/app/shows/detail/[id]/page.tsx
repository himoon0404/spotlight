"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ProcessedShow, ShowTheme } from "@/types/show";
import { PosterImage } from "@/components/ui/PosterImage";
import { PosterCard } from "@/components/home/PosterCard";
import type { ShowDetail } from "@/types/show";

// ─── Theme ───────────────────────────────────────────────────────────────────

const THEME_BG: Record<string, string> = {
  teal:    "linear-gradient(160deg, #0d2a2a 0%, #041414 100%)",
  emerald: "linear-gradient(160deg, #0d2818 0%, #041208 100%)",
  amber:   "linear-gradient(160deg, #251508 0%, #120900 100%)",
  blue:    "linear-gradient(160deg, #071830 0%, #03091a 100%)",
  purple:  "linear-gradient(160deg, #18082e 0%, #0c0418 100%)",
  red:     "linear-gradient(160deg, #3a0c0c 0%, #1c0404 100%)",
};

// ─── Icons ───────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BellIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        className="text-[10px] font-medium mb-0.5 uppercase tracking-wide"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        {label}
      </p>
      <p
        className="text-[12px] font-semibold leading-snug"
        style={{ color: "rgba(255,255,255,0.82)" }}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label, value, isLast,
}: {
  label: string; value: string; isLast?: boolean;
}) {
  return (
    <div
      className="flex gap-3 px-4 py-3"
      style={isLast ? {} : { borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span
        className="text-[11px] font-medium flex-none w-14 pt-0.5"
        style={{ color: "rgba(255,255,255,0.32)" }}
      >
        {label}
      </span>
      <span
        className="text-[13px] flex-1 leading-relaxed"
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        {value}
      </span>
    </div>
  );
}

function SkeletonLine({ w = "100%" }: { w?: string }) {
  return (
    <div
      className="h-3.5 rounded-full animate-pulse"
      style={{ width: w, background: "rgba(255,255,255,0.06)" }}
    />
  );
}

// ─── Nav helper ───────────────────────────────────────────────────────────────

export function buildDetailUrl(show: ProcessedShow): string {
  const p = new URLSearchParams({
    title:  show.title,
    genre:  show.genre,
    venue:  show.venue,
    period: show.period,
    theme:  show.theme,
    ...(show.running    && { running:  show.running }),
    ...(show.ddayLabel  && { dday:     show.ddayLabel }),
    ...(show.isCritical && { critical: "1" }),
    ...(show.posterUrl  && { poster:   show.posterUrl }),
  });
  return `/shows/detail/${show.id}?${p.toString()}`;
}

// ─── Inner page (uses useSearchParams — needs Suspense boundary) ──────────────

function ShowDetailInner() {
  const params        = useParams();
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const id            = typeof params.id === "string" ? params.id : "";

  // Basic info from URL params → available immediately without loading state
  const titleFromUrl    = searchParams.get("title")    ?? "";
  const genreFromUrl    = searchParams.get("genre")    ?? "";
  const venueFromUrl    = searchParams.get("venue")    ?? "";
  const periodFromUrl   = searchParams.get("period")   ?? "";
  const runningFromUrl  = searchParams.get("running")  ?? "";
  const themeFromUrl    = (searchParams.get("theme")   ?? "teal") as ShowTheme;
  const ddayLabelUrl    = searchParams.get("dday")     ?? "";
  const isCriticalUrl   = searchParams.get("critical") === "1";
  const posterFromUrl   = searchParams.get("poster")   ?? undefined;

  const [detail,       setDetail]       = useState<ShowDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [wishlist,        setWishlist]        = useState(false);
  const [alarmed,         setAlarmed]         = useState(false);
  const [expanded,        setExpanded]        = useState(false);
  const [imagesExpanded,  setImagesExpanded]  = useState(false);
  const [showScrollTop,   setShowScrollTop]   = useState(false);
  const [recommended,     setRecommended]     = useState<ProcessedShow[]>([]);

  // Fetch full detail from API
  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();
    fetch(`/api/show-detail?id=${encodeURIComponent(id)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ShowDetail | null) => {
        if (d && !("error" in d)) setDetail(d);
        setDetailLoading(false);
      })
      .catch(() => setDetailLoading(false));
    return () => ctrl.abort();
  }, [id]);

  // Fetch recommended shows
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/shows?area=서울", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        const all: ProcessedShow[] = [
          ...(data.popular ?? []),
          ...(data.hidden  ?? []),
          ...(data.nearby  ?? []),
        ];
        setRecommended(all.filter((s) => s.id !== id).slice(0, 6));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [id]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleRecommendedClick = useCallback(
    (show: ProcessedShow) => { router.push(buildDetailUrl(show)); },
    [router]
  );

  // Merged display values — API data takes priority; URL params fill immediately
  const title    = detail?.title     || titleFromUrl;
  const genre    = detail?.genre     || genreFromUrl;
  const venue    = detail?.venue     || venueFromUrl;
  const period   = (detail?.startDate && detail?.endDate)
    ? `${detail.startDate} – ${detail.endDate}`
    : periodFromUrl;
  const runtime  = detail?.runtime   || runningFromUrl;
  const poster   = detail?.poster ?? posterFromUrl ?? undefined;
  const story    = detail?.story     ?? "";
  const cast     = detail?.cast      ?? "";
  const crew     = detail?.crew      ?? "";
  const prices   = detail?.prices    ?? "";
  const schedule = detail?.schedule  ?? "";
  const age      = detail?.age       ?? "";
  const detailImages = detail?.images ?? [];
  const ddayLabel = ddayLabelUrl;
  const isCritical = isCriticalUrl;

  const bg = THEME_BG[themeFromUrl] ?? THEME_BG.teal;

  const castList = cast
    ? cast.split(/[,·|]/).map((n) => n.trim()).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0c0c] lg:ml-[240px]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 lg:left-[240px] z-40 flex items-center justify-between px-4 pt-5 pb-4"
        style={{
          background: "rgba(12,12,12,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="text-white/50 hover:text-white/90 transition-colors p-1 -ml-1"
          aria-label="뒤로"
        >
          <BackIcon />
        </button>

        {/* Title in header — appears only when poster scrolls out of view */}
        <p
          className="flex-1 text-center text-[13px] font-bold text-white/70 truncate mx-3"
        >
          {title || "공연 상세"}
        </p>

        <div className="flex items-center gap-1">
          <button
            className="p-2 text-white/45 hover:text-white/90 transition-colors"
            aria-label="공유"
          >
            <ShareIcon />
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 pt-[64px] pb-24 lg:pb-8">

        {/* Desktop two-column grid; mobile single-column */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-8 lg:items-start lg:max-w-6xl lg:mx-auto">

          {/* ── Poster column ───────────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-[80px]">
            {/* Full-width on mobile; fixed 360px col on desktop */}
            <div
              className="relative w-full lg:rounded-2xl overflow-hidden"
              style={{ aspectRatio: "2 / 3", background: bg }}
            >
              <PosterImage
                src={poster}
                alt={title || "공연 포스터"}
                genre={genre}
                onLoaded={() => {}}
              />

              {/* Bottom gradient overlay */}
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: "40%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                }}
              />

              {/* Genre + D-day overlay on poster */}
              <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-10">
                <div className="flex items-end justify-between gap-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {genre}
                  </span>
                  {ddayLabel && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-widest ${
                        isCritical ? "dday-critical" : ddayLabel !== "" ? "dday-urgent" : ""
                      }`}
                      style={{
                        background: "rgba(251,191,36,0.18)",
                        border: "1px solid rgba(251,191,36,0.45)",
                        color: "#fbbf24",
                      }}
                    >
                      {ddayLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Detail column ───────────────────────────────────────────────── */}
          <div className="px-5 pt-5 lg:px-0 lg:pt-0">

            {/* Title section */}
            <div className="mb-4">
              <h1
                className="text-[22px] font-black text-white leading-tight mb-2"
              >
                {title || "공연 정보 로딩 중…"}
              </h1>
              {venue && (
                <p
                  className="text-[13px] flex items-start gap-1"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  <span>📍</span>
                  <span>{venue}</span>
                </p>
              )}
            </div>

            {/* Key info cards */}
            {(period || runtime || age) && (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {period  && <InfoCard label="공연 기간" value={period}  />}
                {runtime && <InfoCard label="러닝타임"  value={runtime} />}
                {age     && <InfoCard label="관람 연령" value={age}     />}
              </div>
            )}

            {/* ── Action buttons ─────────────────────────────────────────── */}
            <div className="flex gap-2 mb-6">
              {/* 관심 등록 */}
              <button
                onClick={() => setWishlist((v) => !v)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
                style={
                  wishlist
                    ? {
                        background: "rgba(251,191,36,0.12)",
                        border: "1px solid rgba(251,191,36,0.4)",
                        color: "#fbbf24",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.65)",
                      }
                }
              >
                <HeartIcon filled={wishlist} />
                <span>관심 등록</span>
              </button>

              {/* 알림 받기 */}
              <button
                onClick={() => setAlarmed((v) => !v)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
                style={
                  alarmed
                    ? {
                        background: "rgba(96,165,250,0.12)",
                        border: "1px solid rgba(96,165,250,0.35)",
                        color: "#60a5fa",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.65)",
                      }
                }
              >
                <BellIcon filled={alarmed} />
                <span>알림 받기</span>
              </button>

              {/* 예매하기 */}
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-bold transition-all active:scale-[0.97]"
                style={{ background: "#ffffff", color: "#0c0c0c" }}
              >
                <TicketIcon />
                <span>예매하기</span>
              </button>
            </div>

            {/* Divider */}
            <div
              className="mb-6"
              style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
            />

            {/* ── 공연 소개 ───────────────────────────────────────────────── */}
            <section className="mb-6">
              <h2
                className="text-[12px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                공연 소개
              </h2>

              {detailLoading ? (
                <div className="space-y-2.5">
                  <SkeletonLine w="100%" />
                  <SkeletonLine w="92%" />
                  <SkeletonLine w="85%" />
                  <SkeletonLine w="78%" />
                </div>
              ) : story ? (
                <div>
                  <p
                    className="text-[14px] leading-[1.75] text-white/75"
                    style={
                      expanded
                        ? {}
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical" as const,
                            overflow: "hidden",
                          }
                    }
                  >
                    {story}
                  </p>
                  {story.length > 160 && (
                    <button
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-2 flex items-center gap-1 transition-colors"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                    >
                      <span className="text-[12px] font-medium">
                        {expanded ? "접기" : "더 보기"}
                      </span>
                      <ChevronIcon open={expanded} />
                    </button>
                  )}
                </div>
              ) : (
                <p
                  className="text-[13px]"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  공연 소개 정보를 불러오는 중입니다.
                </p>
              )}
            </section>

            {/* ── 출연진 ─────────────────────────────────────────────────── */}
            <section className="mb-6">
              <h2
                className="text-[12px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                출연진
              </h2>

              {detailLoading ? (
                <div className="flex gap-2 flex-wrap">
                  {[72, 64, 80, 56].map((w, i) => (
                    <div
                      key={i}
                      className="h-7 rounded-full animate-pulse"
                      style={{ width: w, background: "rgba(255,255,255,0.05)" }}
                    />
                  ))}
                </div>
              ) : castList.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {castList.map((name, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-[12px]"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        color: "rgba(255,255,255,0.68)",
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p
                  className="text-[13px]"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  출연진 정보가 없습니다.
                </p>
              )}

              {/* Crew info */}
              {crew && !detailLoading && (
                <p
                  className="mt-3 text-[12px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {crew}
                </p>
              )}
            </section>

            {/* ── 장소 · 일정 · 가격 ─────────────────────────────────────── */}
            {(venue || period || schedule || prices) && (
              <section className="mb-6">
                <h2
                  className="text-[12px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  장소 · 일정 · 가격
                </h2>

                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {venue    && <DetailRow label="공연장"    value={venue}    />}
                  {period   && <DetailRow label="기간"      value={period}   />}
                  {schedule && <DetailRow label="공연 시간" value={schedule} />}
                  {prices   && <DetailRow label="가격"      value={prices}   isLast />}
                  {!prices && !schedule && (
                    <DetailRow label="기간" value={period || "미정"} isLast />
                  )}
                </div>
              </section>
            )}

            {/* ── 이런 공연은 어때요 (3개) ───────────────────────────────── */}
            {recommended.length > 0 && (
              <section className="pb-4">
                <h2
                  className="text-[12px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  이런 공연은 어때요
                </h2>
                <div
                  className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 lg:grid lg:grid-cols-3 lg:overflow-visible lg:mx-0 lg:px-0"
                  style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
                >
                  {recommended.slice(0, 3).map((show) => (
                    <div
                      key={show.id}
                      className="flex-none w-[130px] lg:w-auto cursor-pointer"
                      onClick={() => handleRecommendedClick(show)}
                    >
                      <PosterCard show={show} />
                    </div>
                  ))}
                  <div className="flex-none w-1 lg:hidden" aria-hidden />
                </div>
              </section>
            )}

          </div>{/* end detail column */}
        </div>{/* end two-column grid */}

        {/* ── 상세정보 — 하단 단독 섹션 ──────────────────────────────────── */}
        {detailImages.length > 0 && (
          <section className="mt-8">
            <div
              className="mx-5 lg:mx-10 mb-6"
              style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
            />

            {imagesExpanded ? (
              <div className="px-5 lg:px-10 lg:max-w-6xl lg:mx-auto">
                <div className="space-y-3 pb-4">
                  {detailImages.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`상세 이미지 ${i + 1}`}
                      className="w-full rounded-2xl"
                      loading="lazy"
                    />
                  ))}
                </div>
                <div className="flex justify-center pb-6">
                  <button
                    onClick={() => setImagesExpanded(false)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97]"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <ChevronIcon open={true} />
                    <span>접기</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative px-5 lg:px-10 lg:max-w-6xl lg:mx-auto">
                <div className="overflow-hidden rounded-2xl" style={{ maxHeight: "380px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detailImages[0]}
                    alt="상세 이미지 미리보기"
                    className="w-full"
                    loading="lazy"
                  />
                </div>
                <div
                  className="absolute inset-x-5 lg:inset-x-10 bottom-0 rounded-b-2xl"
                  style={{
                    height: "220px",
                    background: "linear-gradient(to bottom, transparent 0%, #0c0c0c 85%)",
                    pointerEvents: "none",
                  }}
                />
                <div className="absolute inset-x-0 bottom-6 flex justify-center">
                  <button
                    onClick={() => setImagesExpanded(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-bold transition-all active:scale-[0.97]"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      color: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span>상세정보 펼치기</span>
                    <ChevronIcon open={false} />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 하단 여백 */}
        <div className="h-24 lg:h-12" />
      </main>

      {/* ── 맨 위로 버튼 ─────────────────────────────────────────────────── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-5 lg:bottom-8 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: "rgba(30,30,30,0.85)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
          aria-label="맨 위로"
        >
          <ArrowUpIcon />
        </button>
      )}
    </div>
  );
}

// ─── Page export (Suspense boundary for useSearchParams) ─────────────────────

function ShowDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0c0c0c] lg:ml-[240px]">
      <header
        className="fixed top-0 left-0 right-0 lg:left-[240px] z-40 px-4 pt-5 pb-4"
        style={{ background: "#0c0c0c", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="h-5 w-24 rounded animate-pulse bg-white/5" />
      </header>
      <main className="flex-1 pt-[64px]">
        <div className="w-full animate-pulse bg-white/5" style={{ aspectRatio: "2 / 3" }} />
        <div className="px-5 pt-5 space-y-3">
          <div className="h-6 w-48 rounded animate-pulse bg-white/5" />
          <div className="h-4 w-32 rounded animate-pulse bg-white/5" />
        </div>
      </main>
    </div>
  );
}

export default function ShowDetailPage() {
  return (
    <Suspense fallback={<ShowDetailSkeleton />}>
      <ShowDetailInner />
    </Suspense>
  );
}
