"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  COMMUNITY_POSTS,
  MOCK_COMMENTS,
  CAT_CONFIG,
  type MockComment,
} from "@/lib/communityData";

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  );
}

function SmallHeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({ comment, catColor }: { comment: MockComment; catColor: string }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((n) => (liked ? n - 1 : n + 1));
  };

  return (
    <div className="flex gap-3 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-black"
        style={{ background: catColor }}
      >
        {comment.avatar}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[13px] font-semibold text-white">{comment.author}</span>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>{comment.time}</span>
        </div>
        <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
          {comment.content}
        </p>
        <button
          onClick={toggleLike}
          className="flex items-center gap-1 mt-2 transition-colors"
          style={{ color: liked ? catColor : "rgba(255,255,255,0.28)" }}
        >
          <SmallHeartIcon filled={liked} />
          <span className="text-[12px]">{likeCount}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const post = COMMUNITY_POSTS.find((p) => p.id === id);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0);
  const [commentInput, setCommentInput] = useState("");
  const [localComments, setLocalComments] = useState<MockComment[]>([]);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#0c0c0c] lg:pl-[240px] flex items-center justify-center pb-[76px]">
        <div className="text-center">
          <p className="text-[16px] text-white/40 mb-4">글을 찾을 수 없어요</p>
          <Link href="/community" className="text-[14px] text-amber-400 underline underline-offset-4">
            커뮤니티로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const conf = CAT_CONFIG[post.category];
  const comments = [...(MOCK_COMMENTS[id] ?? []), ...localComments];

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((n) => (liked ? n - 1 : n + 1));
  };

  const handleSubmitComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    const newComment: MockComment = {
      id: `local-${Date.now()}`,
      author: "나",
      avatar: "나",
      content: text,
      time: "방금",
      likes: 0,
    };
    setLocalComments((prev) => [newComment, ...prev]);
    setCommentInput("");
  };

  return (
    <main className="min-h-screen bg-[#0c0c0c] lg:pl-[240px] pb-[140px]">

      {/* ── Top Nav ──────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4 lg:px-8"
        style={{ background: "rgba(12,12,12,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
        >
          <ArrowLeftIcon />
        </button>
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{ background: conf.bg, color: conf.color }}
        >
          {post.category}
        </span>
        <span className="text-[13px] font-medium text-white/50 truncate flex-1">{post.title}</span>
      </div>

      <div className="px-5 lg:px-8 max-w-3xl pt-6 space-y-6">

        {/* ── Post Header ──────────────────────────────────────────────── */}
        <div>
          <h1 className="text-[22px] lg:text-[26px] font-black text-white leading-snug mb-4">
            {post.title}
          </h1>

          {/* Author row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-black"
                style={{ background: conf.color }}
              >
                {post.avatar}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">{post.author}</p>
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>{post.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tags ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg text-[12px]"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}
            >
              #{tag}
            </span>
          ))}
          {post.region && (
            <span
              className="px-2.5 py-1 rounded-lg text-[12px]"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
            >
              📍 {post.region}
            </span>
          )}
          {post.artistName && (
            <span
              className="px-2.5 py-1 rounded-lg text-[12px]"
              style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
            >
              ⭐ {post.artistName}
            </span>
          )}
          {post.performanceId && (
            <Link
              href={`/shows/detail/${post.performanceId}`}
              className="px-2.5 py-1 rounded-lg text-[12px] transition-opacity hover:opacity-70"
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}
            >
              🎭 공연 보기 →
            </Link>
          )}
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 lg:p-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[15px] lg:text-[16px] leading-[1.8] text-white/80 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* ── Engagement ───────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-4 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={toggleLike}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-[14px] transition-all"
            style={
              liked
                ? { background: conf.bg, color: conf.color }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }
            }
          >
            <HeartIcon filled={liked} />
            {likeCount}
          </button>

          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px]"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}
          >
            <CommentIcon />
            {comments.length}
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] transition-colors ml-auto"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}
          >
            <ShareIcon />
            공유
          </button>
        </div>

        {/* ── Comments ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[15px] font-bold text-white mb-1">
            댓글{" "}
            <span style={{ color: conf.color }}>{comments.length}</span>
          </h2>

          {comments.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "rgba(255,255,255,0.28)" }}>
              <p className="text-[14px]">첫 번째 댓글을 남겨보세요</p>
            </div>
          ) : (
            <div>
              {comments.map((c) => (
                <CommentItem key={c.id} comment={c} catColor={conf.color} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Fixed Comment Input ───────────────────────────────────────── */}
      <div
        className="fixed left-0 right-0 z-40 px-5 py-4 lg:pl-[calc(240px+20px)] lg:pr-8"
        style={{
          bottom: "env(safe-area-inset-bottom, 0px)",
          paddingBottom: "calc(76px + 12px)",
          background: "rgba(12,12,12,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex gap-3 max-w-3xl mx-auto lg:mx-0">
          {/* Current user avatar */}
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-black"
            style={{ background: "#fbbf24" }}
          >
            나
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-2xl px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmitComment(); } }}
              placeholder="댓글을 입력하세요..."
              className="flex-1 bg-transparent text-[14px] text-white outline-none"
              style={{ caretColor: conf.color }}
            />
            <button
              onClick={handleSubmitComment}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={
                commentInput.trim()
                  ? { background: conf.color, color: "#000" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" }
              }
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}
