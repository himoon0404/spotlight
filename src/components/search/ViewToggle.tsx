"use client";

type View = "map" | "list";

interface Props {
  active: View;
  onChange: (v: View) => void;
}

export function ViewToggle({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 px-5 mb-4">
      {(["map", "list"] as View[]).map((v) => {
        const isActive = active === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide transition-all"
            style={
              isActive
                ? { background: "rgba(255,255,255,0.92)", color: "#0c0c0c" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }
            }
          >
            {v === "map" ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
                지도 보기
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                리스트 보기
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
