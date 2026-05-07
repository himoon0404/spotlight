"use client";

import { useState } from "react";

const INITIAL_LIMIT = 6;

interface Props {
  venues: string[];
  selected: string | null;
  onSelect: (v: string | null) => void;
}

export function VenueFilterChips({ venues, selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (venues.length === 0) return null;

  const visible = expanded ? venues : venues.slice(0, INITIAL_LIMIT);
  const hiddenCount = venues.length - INITIAL_LIMIT;

  return (
    <div className="mt-4 mb-1">
      <p
        className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2.5 px-5"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        공연장
      </p>
      <div
        className="flex flex-wrap gap-2 px-5 pb-1"
      >
        {/* 전체 칩 */}
        <button
          onClick={() => onSelect(null)}
          className="flex-none px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap"
          style={
            selected === null
              ? { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)" }
              : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }
          }
        >
          전체
        </button>

        {visible.map((name) => {
          const active = selected === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(active ? null : name)}
              className="flex-none px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap"
              style={
                active
                  ? { background: "rgba(255,255,255,0.9)", color: "#0c0c0c", fontWeight: "700" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              {name}
            </button>
          );
        })}

        {/* 더보기 / 접기 */}
        {!expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="flex-none px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px dashed rgba(255,255,255,0.15)" }}
          >
            +{hiddenCount} 더보기
          </button>
        )}
        {expanded && venues.length > INITIAL_LIMIT && (
          <button
            onClick={() => setExpanded(false)}
            className="flex-none px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px dashed rgba(255,255,255,0.15)" }}
          >
            접기
          </button>
        )}
      </div>
    </div>
  );
}
