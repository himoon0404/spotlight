"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  COMMUNITY_POSTS,
  POPULAR_ROOMS,
  CAT_CONFIG,
  type PostCategory,
  type CommunityPost,
  type PopularRoom,
} from "@/lib/communityData";
import "./community.css";

// ─── Category config ─────────────────────────────────────────────────────────

type CategoryFilter = PostCategory | "전체";

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: "전체",     label: "전체" },
  { id: "공연별",    label: "공연별 이야기" },
  { id: "아티스트별", label: "아티스트별" },
  { id: "지역별",    label: "지역별 이야기" },
  { id: "입문자",    label: "입문자 게시판" },
  { id: "자유",      label: "자유 이야기" },
];

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산",
  "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ─── Write Modal ──────────────────────────────────────────────────────────────

function WriteModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<PostCategory>("자유");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [region, setRegion] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    outline: "none",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center">
      <div
        className="community-modal-overlay absolute inset-0 bg-black/75"
        style={{ backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div
        className="community-modal relative w-full lg:max-w-[560px] rounded-t-3xl lg:rounded-3xl flex flex-col"
        style={{
          background: "#131313",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "92dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile only) */}
        <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <h2 className="text-[17px] font-bold text-white">새 글 쓰기</h2>
            <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
              공연 이야기를 자유롭게 나눠보세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Category */}
          <div>
            <label className="text-[11px] font-semibold tracking-widest uppercase block mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CAT_CONFIG) as PostCategory[]).map((c) => {
                const active = category === c;
                const conf = CAT_CONFIG[c];
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all"
                    style={
                      active
                        ? { background: conf.color, color: "#000", fontWeight: 700 }
                        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold tracking-widest uppercase block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              className="w-full rounded-xl px-4 py-3 text-[15px] text-white transition-all"
              style={inputStyle}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[11px] font-semibold tracking-widest uppercase block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공연 이야기를 자유롭게 써주세요..."
              rows={5}
              className="w-full rounded-xl px-4 py-3 text-[15px] text-white resize-none leading-relaxed transition-all"
              style={inputStyle}
            />
          </div>

          {/* Region */}
          <div>
            <label className="text-[11px] font-semibold tracking-widest uppercase block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              관련 지역 <span style={{ color: "rgba(255,255,255,0.25)" }}>(선택)</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-[15px] text-white appearance-none cursor-pointer transition-all"
              style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}
            >
              <option value="" style={{ background: "#1a1a1a" }}>지역을 선택하세요</option>
              {REGIONS.map((r) => (
                <option key={r} value={r} style={{ background: "#1a1a1a" }}>{r}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold tracking-widest uppercase block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              공연·아티스트 태그 <span style={{ color: "rgba(255,255,255,0.25)" }}>(선택)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="예: 조성진, 오페라의 유령"
                className="flex-1 rounded-xl px-4 py-3 text-[14px] text-white transition-all"
                style={inputStyle}
              />
              <button
                onClick={addTag}
                className="px-4 py-3 rounded-xl text-[14px] font-medium transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
              >
                추가
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px]"
                    style={{ background: "rgba(251,191,36,0.14)", color: "#fbbf24" }}
                  >
                    #{t}
                    <button
                      onClick={() => removeTag(t)}
                      className="transition-colors hover:text-white/70 text-base leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all mt-1"
            style={{ background: "#fbbf24", color: "#000" }}
          >
            글 올리기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: CommunityPost }) {
  const conf = CAT_CONFIG[post.category];

  return (
    <Link
      href={`/community/${post.id}`}
      className="community-post-card block rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{ background: conf.bg, color: conf.color }}
        >
          {post.category}
        </span>
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
          {post.createdAt}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-white leading-snug mb-2">{post.title}</h3>

      {/* Content preview */}
      <p
        className="text-[13px] leading-relaxed mb-3.5"
        style={{
          color: "rgba(255,255,255,0.45)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.content}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md text-[11px]"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.38)" }}
          >
            #{tag}
          </span>
        ))}
        {post.region && (
          <span
            className="px-2 py-0.5 rounded-md text-[11px]"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
          >
            📍 {post.region}
          </span>
        )}
        {post.artistName && (
          <span
            className="px-2 py-0.5 rounded-md text-[11px]"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
          >
            ⭐ {post.artistName}
          </span>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: conf.color, color: "#000" }}
          >
            {post.avatar}
          </div>
          <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.38)" }}>
            {post.author}
          </span>
        </div>
        <div className="flex items-center gap-3.5" style={{ color: "rgba(255,255,255,0.28)" }}>
          <span className="flex items-center gap-1 text-[12px]">
            <HeartIcon /> {post.likes}
          </span>
          <span className="flex items-center gap-1 text-[12px]">
            <CommentIcon /> {post.comments}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Popular Room Card ────────────────────────────────────────────────────────

function RoomCard({ room, onClick }: { room: PopularRoom; onClick: () => void }) {
  return (
    <button
      className="community-room-card rounded-2xl p-4 flex flex-col gap-2 text-left w-full"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${room.accentColor}`,
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-2xl mt-0.5 flex-shrink-0">{room.icon}</span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white leading-snug line-clamp-1">
            {room.title}
          </p>
          <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.38)" }}>
            {room.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[11px] font-medium" style={{ color: room.accentColor + "bb" }}>
          글 {room.postsCount}개
        </span>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.32)" }}>
          {room.participantsCount}명 참여
        </span>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("전체");
  const [showWriteModal, setShowWriteModal] = useState(false);

  const filteredPosts = useMemo(
    () =>
      activeCategory === "전체"
        ? COMMUNITY_POSTS
        : COMMUNITY_POSTS.filter((p) => p.category === activeCategory),
    [activeCategory],
  );

  const handleRoomClick = (category: PostCategory) => {
    setActiveCategory(category);
    document.getElementById("community-posts-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main
      className="min-h-screen bg-[#0c0c0c] pb-[96px] lg:pb-12 lg:pl-[240px]"
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-14 pb-10 lg:px-10 lg:pt-16">
        {/* Spotlight gradients */}
        <div
          className="community-hero-glow absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(251,191,36,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-60px",
            left: "10%",
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl">
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="community-live-dot w-1.5 h-1.5 rounded-full"
              style={{ background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.7)" }}
            />
            <span
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "rgba(251,191,36,0.65)" }}
            >
              Community
            </span>
          </div>

          <h1 className="text-[26px] lg:text-[34px] font-black text-white leading-tight mb-3">
            공연을 좋아하는<br />
            사람들이 모이는 곳
          </h1>
          <p
            className="text-[14px] lg:text-[15px] leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            후기, 질문, 좌석 이야기, 지역 공연 추천까지
            <br className="sm:hidden" />
            {" "}자유롭게 나눠보세요.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-5 mt-7">
            {[
              { value: "1,248", label: "오늘의 이야기" },
              { value: "3,891", label: "활동 중인 멤버" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-5">
                {i > 0 && (
                  <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.1)" }} />
                )}
                <div>
                  <p className="text-[20px] font-black text-white">{stat.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
            <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div>
              <p
                className="community-live-dot text-[13px] font-black"
                style={{ color: "#ef4444" }}
              >
                ● 실시간
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                지금 활발함
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-10 space-y-10 max-w-5xl">

        {/* ── Popular Rooms ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-white">지금 뜨거운 이야기</h2>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
              실시간 업데이트
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {POPULAR_ROOMS.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onClick={() => handleRoomClick(room.category)}
              />
            ))}
          </div>
        </section>

        {/* ── Posts ──────────────────────────────────────────────────── */}
        <section id="community-posts-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-white">실시간 이야기</h2>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
              {filteredPosts.length}개
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 community-tabs-scroll">
            {CATEGORY_TABS.map((tab) => {
              const active = activeCategory === tab.id;
              const isCat = tab.id !== "전체";
              const conf = isCat ? CAT_CONFIG[tab.id as PostCategory] : null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className="flex-none px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all"
                  style={
                    active
                      ? { background: conf ? conf.color : "#ffffff", color: "#000", fontWeight: 700 }
                      : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Post Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[15px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                아직 이야기가 없어요
              </p>
              <p className="text-[13px] mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                첫 번째 글을 써보세요!
              </p>
            </div>
          )}

          {/* Load more hint */}
          {filteredPosts.length > 0 && (
            <div className="mt-6 text-center">
              <button
                className="px-6 py-3 rounded-full text-[13px] font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                더 많은 이야기 보기
              </button>
            </div>
          )}
        </section>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* ── FAB Write Button ───────────────────────────────────────────── */}
      <button
        onClick={() => setShowWriteModal(true)}
        className="community-fab fixed z-40 flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-[14px] text-black"
        style={{ background: "#fbbf24", boxShadow: "0 4px 20px rgba(251,191,36,0.38)" }}
      >
        <PenIcon />
        글쓰기
      </button>

      {/* ── Write Modal ───────────────────────────────────────────────── */}
      {showWriteModal && <WriteModal onClose={() => setShowWriteModal(false)} />}
    </main>
  );
}
