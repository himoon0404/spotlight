"use client";

import { useState } from "react";
import { ReviewData, ChallengePerformance } from "@/lib/reviewChallengeService";

interface Props {
  performance: ChallengePerformance;
  onSubmit: (data: ReviewData) => Promise<void>;
  onClose: () => void;
}

const MIN_LENGTH = 100;

export default function ReviewModal({ performance, onSubmit, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValid = rating > 0 && text.trim().length >= MIN_LENGTH;
  const remaining = Math.max(0, MIN_LENGTH - text.trim().length);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    await onSubmit({ rating, text: text.trim() });
  };

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-sheet" onClick={(e) => e.stopPropagation()}>

        <div className="rm-handle" />

        <div className="rm-header">
          <p className="rm-event-label">5월 리뷰 챌린지</p>
          <h3 className="rm-title">{performance.title}</h3>
          <p className="rm-place">{performance.place}</p>
        </div>

        {/* 별점 */}
        <div className="rm-section">
          <p className="rm-label">별점 <span className="rm-required">*</span></p>
          <div className="rm-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`rm-star${(hovered || rating) >= n ? " active" : ""}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${n}점`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="rm-rating-label">{["", "별로예요", "그저 그래요", "보통이에요", "좋아요", "최고예요"][rating]}</p>
          )}
        </div>

        {/* 감상평 */}
        <div className="rm-section">
          <div className="rm-label-row">
            <p className="rm-label">감상평 <span className="rm-required">*</span></p>
            <span className={`rm-count${text.trim().length >= MIN_LENGTH ? " done" : ""}`}>
              {text.trim().length} / {MIN_LENGTH}자 이상
            </span>
          </div>
          <textarea
            className="rm-textarea"
            placeholder="공연에 대한 솔직한 감상을 남겨주세요. 100자 이상 작성해야 챌린지에 참여됩니다."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          />
          {remaining > 0 && text.length > 0 && (
            <p className="rm-hint">아직 {remaining}자 더 필요해요</p>
          )}
        </div>

        {/* 안내 */}
        <div className="rm-notice">
          <span className="rm-notice-dot" />
          검토 완료 후 +30 XP 및 배지가 지급됩니다
        </div>

        {/* 버튼 */}
        <div className="rm-actions">
          <button className="rm-cancel" onClick={onClose} disabled={submitting}>취소</button>
          <button
            className={`rm-submit${isValid ? " valid" : ""}`}
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? "제출 중..." : "리뷰 제출하기"}
          </button>
        </div>

      </div>

      <style>{`
        .rm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          z-index: 200;
          display: flex; align-items: flex-end;
          backdrop-filter: blur(6px);
          animation: rm-bg-in 0.2s ease;
        }
        @keyframes rm-bg-in { from { opacity:0 } to { opacity:1 } }

        .rm-sheet {
          width: 100%; max-width: 640px; margin: 0 auto;
          background: #131318;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px 24px 0 0;
          padding: 12px 20px 40px;
          animation: rm-slide-up 0.3s cubic-bezier(0.34,1.2,0.64,1);
          max-height: 92vh; overflow-y: auto;
        }
        @keyframes rm-slide-up { from { transform:translateY(100%) } to { transform:translateY(0) } }

        .rm-handle {
          width: 36px; height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 100px;
          margin: 0 auto 20px;
        }

        .rm-header { margin-bottom: 20px; }
        .rm-event-label {
          font-size: 11px; font-weight: 700;
          color: #34d399; letter-spacing: 0.06em;
          text-transform: uppercase; margin: 0 0 6px;
        }
        .rm-title {
          font-size: 17px; font-weight: 800;
          color: #fff; margin: 0 0 4px;
          line-height: 1.3; letter-spacing: -0.02em;
        }
        .rm-place { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }

        .rm-section { margin-bottom: 20px; }
        .rm-label {
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.8); margin: 0 0 10px;
        }
        .rm-required { color: #34d399; }

        .rm-stars { display: flex; gap: 6px; margin-bottom: 6px; }
        .rm-star {
          font-size: 32px; color: rgba(255,255,255,0.15);
          background: none; border: none; cursor: pointer;
          transition: color 0.15s, transform 0.1s;
          padding: 0; line-height: 1;
        }
        .rm-star.active { color: #f5c518; }
        .rm-star:hover { transform: scale(1.15); }
        .rm-rating-label {
          font-size: 12px; color: #f5c518;
          margin: 0; font-weight: 600;
        }

        .rm-label-row {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 10px;
        }
        .rm-count {
          font-size: 11px; color: rgba(255,255,255,0.35);
          font-variant-numeric: tabular-nums;
          transition: color 0.2s;
        }
        .rm-count.done { color: #34d399; font-weight: 700; }

        .rm-textarea {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 14px;
          color: #fff; font-size: 14px; line-height: 1.65;
          resize: none; outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .rm-textarea:focus { border-color: rgba(52,211,153,0.4); }
        .rm-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .rm-hint {
          font-size: 11px; color: rgba(255,255,255,0.35);
          margin: 6px 0 0; text-align: right;
        }

        .rm-notice {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
        }
        .rm-notice-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #34d399; flex-shrink: 0;
        }

        .rm-actions { display: flex; gap: 10px; }
        .rm-cancel {
          flex: 1; padding: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: rgba(255,255,255,0.6);
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .rm-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
        .rm-submit {
          flex: 2; padding: 14px;
          background: rgba(52,211,153,0.15);
          border: 1px solid rgba(52,211,153,0.25);
          border-radius: 14px; color: rgba(52,211,153,0.5);
          font-size: 15px; font-weight: 800; cursor: not-allowed;
          transition: all 0.2s; letter-spacing: -0.01em;
        }
        .rm-submit.valid {
          background: linear-gradient(135deg, #34d399, #10b981);
          border-color: transparent; color: #000; cursor: pointer;
        }
        .rm-submit.valid:hover { opacity: 0.9; transform: translateY(-1px); }
        .rm-submit:disabled:not(.valid) { cursor: not-allowed; }
      `}</style>
    </div>
  );
}
