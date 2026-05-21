"use client";

import { useState, useRef } from "react";
import { VerificationData, ChallengePerformance } from "@/lib/reviewChallengeService";

interface Props {
  performance: ChallengePerformance;
  rejectionReason?: string;
  onSubmit: (data: VerificationData) => void;
  onClose: () => void;
}

function parseKopisDate(dateStr: string): string {
  return dateStr.replace(/\./g, "-");
}

export default function VerificationModal({ performance, rejectionReason, onSubmit, onClose }: Props) {
  const [reservationNumber, setReservationNumber] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const minDate = parseKopisDate(performance.startDate);
  const maxDate = parseKopisDate(performance.endDate);
  const isValid = reservationNumber.trim().length >= 4 && watchedDate !== "" && ticketFile !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTicketFile(file);
  };

  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    onSubmit({
      reservationNumber: reservationNumber.trim(),
      ticketImageUrl: ticketFile!.name,
      watchedDate,
    });
  };

  return (
    <div className="vm-overlay" onClick={onClose}>
      <div className="vm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="vm-handle" />

        <div className="vm-header">
          <p className="vm-event-label">5월 리뷰 챌린지</p>
          <h3 className="vm-title">관람 인증</h3>
          <p className="vm-subtitle">{performance.title}</p>
          <p className="vm-place">{performance.place}</p>
        </div>

        {rejectionReason && (
          <div className="vm-rejection-notice">
            <span className="vm-rejection-icon">⚠</span>
            <div>
              <p className="vm-rejection-label">이전 인증 반려 사유</p>
              <p className="vm-rejection-reason">{rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="vm-section">
          <label className="vm-label">
            예매번호 <span className="vm-required">*</span>
          </label>
          <input
            className="vm-input"
            type="text"
            placeholder="예매번호를 입력해주세요 (예: R20240515-001)"
            value={reservationNumber}
            onChange={(e) => setReservationNumber(e.target.value)}
          />
        </div>

        <div className="vm-section">
          <label className="vm-label">
            관람일 <span className="vm-required">*</span>
          </label>
          <input
            className="vm-input vm-date-input"
            type="date"
            min={minDate}
            max={maxDate}
            value={watchedDate}
            onChange={(e) => setWatchedDate(e.target.value)}
          />
          <p className="vm-field-hint">
            공연 기간: {performance.startDate} ~ {performance.endDate}
          </p>
        </div>

        <div className="vm-section">
          <label className="vm-label">
            티켓 / 예매내역 이미지 <span className="vm-required">*</span>
          </label>
          <button
            className={`vm-upload-btn${ticketFile ? " has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {ticketFile ? (
              <>
                <span className="vm-upload-check">✓</span>
                <span className="vm-upload-filename">{ticketFile.name}</span>
              </>
            ) : (
              <>
                <span className="vm-upload-icon">📎</span>
                <span>이미지 업로드</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <p className="vm-field-hint">JPG, PNG, PDF 지원 · 검증 목적으로만 사용됩니다</p>
        </div>

        <div className="vm-notice">
          <span className="vm-notice-dot" />
          인증 완료 후 리뷰 작성이 가능합니다. 검토는 보통 수 분 내 완료됩니다.
        </div>

        <div className="vm-actions">
          <button className="vm-cancel" onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button
            className={`vm-submit${isValid ? " valid" : ""}`}
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? "제출 중..." : "인증 신청하기"}
          </button>
        </div>
      </div>

      <style>{`
        .vm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.78);
          z-index: 200;
          display: flex; align-items: flex-end;
          backdrop-filter: blur(6px);
          animation: vm-bg-in 0.2s ease;
        }
        @keyframes vm-bg-in { from { opacity:0 } to { opacity:1 } }

        .vm-sheet {
          width: 100%; max-width: 640px; margin: 0 auto;
          background: #131318;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px 24px 0 0;
          padding: 12px 20px 48px;
          animation: vm-slide-up 0.3s cubic-bezier(0.34,1.2,0.64,1);
          max-height: 92vh; overflow-y: auto;
        }
        @keyframes vm-slide-up { from { transform:translateY(100%) } to { transform:translateY(0) } }

        .vm-handle {
          width: 36px; height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 100px;
          margin: 0 auto 20px;
        }

        .vm-header { margin-bottom: 20px; }
        .vm-event-label {
          font-size: 11px; font-weight: 700;
          color: #34d399; letter-spacing: 0.06em;
          text-transform: uppercase; margin: 0 0 6px;
        }
        .vm-title {
          font-size: 20px; font-weight: 800;
          color: #fff; margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .vm-subtitle {
          font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.7); margin: 0 0 3px;
          line-height: 1.35;
        }
        .vm-place { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }

        .vm-rejection-notice {
          display: flex; gap: 10px; align-items: flex-start;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px; padding: 12px 14px;
          margin-bottom: 18px;
        }
        .vm-rejection-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .vm-rejection-label {
          font-size: 11px; font-weight: 700; color: #f87171;
          margin: 0 0 3px; letter-spacing: 0.02em;
        }
        .vm-rejection-reason {
          font-size: 13px; color: rgba(255,255,255,0.6);
          margin: 0; line-height: 1.5;
        }

        .vm-section { margin-bottom: 18px; }
        .vm-label {
          display: block;
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.8); margin-bottom: 8px;
        }
        .vm-required { color: #34d399; }

        .vm-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 12px 14px;
          color: #fff; font-size: 14px;
          outline: none; box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .vm-input:focus { border-color: rgba(52,211,153,0.4); }
        .vm-input::placeholder { color: rgba(255,255,255,0.25); }

        .vm-date-input {
          color-scheme: dark;
          cursor: pointer;
        }

        .vm-field-hint {
          font-size: 11px; color: rgba(255,255,255,0.35);
          margin: 6px 0 0;
        }

        .vm-upload-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px dashed rgba(255,255,255,0.15);
          border-radius: 12px; padding: 14px;
          color: rgba(255,255,255,0.45);
          font-size: 13px; font-weight: 600;
          cursor: pointer; box-sizing: border-box;
          transition: all 0.2s;
        }
        .vm-upload-btn:hover {
          border-color: rgba(52,211,153,0.3);
          color: rgba(255,255,255,0.65);
        }
        .vm-upload-btn.has-file {
          border-style: solid;
          border-color: rgba(52,211,153,0.35);
          background: rgba(52,211,153,0.06);
          color: #34d399;
        }
        .vm-upload-icon { font-size: 16px; }
        .vm-upload-check {
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(52,211,153,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #34d399; flex-shrink: 0;
        }
        .vm-upload-filename {
          overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; max-width: 220px;
        }

        .vm-notice {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
        }
        .vm-notice-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #34d399; flex-shrink: 0;
        }

        .vm-actions { display: flex; gap: 10px; }
        .vm-cancel {
          flex: 1; padding: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: rgba(255,255,255,0.6);
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .vm-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
        .vm-submit {
          flex: 2; padding: 14px;
          background: rgba(52,211,153,0.12);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 14px; color: rgba(52,211,153,0.45);
          font-size: 15px; font-weight: 800; cursor: not-allowed;
          transition: all 0.2s; letter-spacing: -0.01em;
        }
        .vm-submit.valid {
          background: linear-gradient(135deg, #34d399, #10b981);
          border-color: transparent; color: #000; cursor: pointer;
        }
        .vm-submit.valid:hover { opacity: 0.9; transform: translateY(-1px); }
        .vm-submit:disabled:not(.valid) { cursor: not-allowed; }
      `}</style>
    </div>
  );
}
