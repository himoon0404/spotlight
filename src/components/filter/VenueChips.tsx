"use client";

import type { Venue } from "@/lib/kopis";

interface Props {
  venues: Venue[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (venueId: string | null, venueName: string) => void;
}

export function VenueChips({ venues, loading, selectedId, onSelect }: Props) {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-5 pb-2 pt-1"
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      <button
        onClick={() => onSelect(null, "")}
        className="flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap"
        style={
          selectedId === null
            ? { background: "rgba(255,255,255,0.88)", color: "#0c0c0c" }
            : {
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              }
        }
      >
        전체 공연장
      </button>

      {loading
        ? [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-none h-[30px] rounded-full animate-pulse bg-white/5"
              style={{ width: `${64 + i * 12}px` }}
            />
          ))
        : venues.map((v) => {
            const active = selectedId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(active ? null : v.id, active ? "" : v.name)}
                className="flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap"
                style={
                  active
                    ? { background: "rgba(251,191,36,0.88)", color: "#0c0c0c" }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.35)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {v.name}
              </button>
            );
          })}

      <div className="flex-none w-1" aria-hidden />
    </div>
  );
}
