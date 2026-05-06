"use client";

interface Props {
  keyword: string;
  onChange: (v: string) => void;
}

export function SearchHeader({ keyword, onChange }: Props) {
  return (
    <div className="px-5 pt-3 pb-4">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onChange(e.target.value)}
          placeholder="공연명, 공연장, 장르를 검색해보세요"
          className="w-full rounded-xl pl-10 pr-10 py-3 text-[13px] text-white placeholder:text-white/30 outline-none transition-colors"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: keyword
              ? "1px solid rgba(251,191,36,0.45)"
              : "1px solid rgba(255,255,255,0.1)",
          }}
        />
        {keyword && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-[11px] mt-2 px-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
        지도와 장르 필터로 나에게 맞는 공연을 찾아보세요
      </p>
    </div>
  );
}
