"use client";

import { useState, useCallback } from "react";

const GENRE_EMOJI: Record<string, string> = {
  뮤지컬: "🎭", 연극: "🎪", 재즈: "🎷", 클래식: "🎻",
  무용: "💃", 발레: "🩰", 서양음악: "🎼", 한국음악: "🪘",
  국악: "🪷", 오페라: "🎤", 인디음악: "🎸", 복합: "✨",
};

interface Props {
  src: string | undefined;
  alt: string;
  genre?: string;
  /** 잘림 기준점. 공연 포스터는 상단에 핵심 정보가 있으므로 기본값 "center top" */
  position?: string;
  /** 로드 완료 콜백 — 부모가 블러 배경 등을 동기화할 때 사용 */
  onLoaded?: () => void;
  className?: string;
}

type ImgState = "loading" | "loaded" | "error";

/**
 * 포스터 이미지 전용 컴포넌트.
 *
 * 레이아웃 보장 구조:
 *   부모 div: overflow-hidden + aspect-ratio  ← 틀 고정
 *   img:      absolute inset-0 + object-cover  ← 틀을 빈틈없이 채움
 *
 * object-cover를 쓰는 이유:
 *   포스터 원본 비율(1:1, 2:3, 가로형 등)에 관계없이
 *   카드 영역을 항상 꽉 채워 레이아웃이 깨지지 않는다.
 *   넘친 부분은 부모의 overflow-hidden이 자른다.
 */
export function PosterImage({ src, alt, genre, position = "center top", onLoaded, className = "" }: Props) {
  const [state, setState] = useState<ImgState>(src ? "loading" : "error");
  const emoji = GENRE_EMOJI[genre ?? ""] ?? "🎬";

  const handleLoad = useCallback(() => {
    setState("loaded");
    onLoaded?.();
  }, [onLoaded]);

  const handleError = useCallback(() => {
    setState("error");
  }, []);

  const loaded = state === "loaded";
  const failed = state === "error";

  return (
    <>
      {/* 로딩 shimmer */}
      {state === "loading" && (
        <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
      )}

      {/* 포스터 없음 / 로드 실패 → 장르 이모지 */}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className={`leading-none ${className}`} style={{ fontSize: "clamp(40px,12cqw,72px)", opacity: 0.1 }}>
            {emoji}
          </span>
        </div>
      )}

      {/* 포스터 이미지
          - absolute inset-0 w-full h-full: 부모 틀을 정확히 채움
          - object-cover: 비율 유지하면서 빈 공간 없이 꽉 채움 (넘친 부분은 부모 overflow-hidden이 자름)
          - object-position: 잘릴 때 어느 쪽을 기준으로 잘지 결정 */}
      {src && !failed && (
        <img
          key={src}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className="absolute inset-0 w-full h-full transition-opacity duration-500"
          style={{
            objectFit: "cover",
            objectPosition: position,
            opacity: loaded ? 1 : 0,
          }}
        />
      )}
    </>
  );
}
