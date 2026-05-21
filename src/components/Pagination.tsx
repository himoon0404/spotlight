"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  const btnBase: React.CSSProperties = {
    minWidth: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    transition: "background 0.15s, color 0.15s",
    cursor: "pointer",
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      {/* Prev */}
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        style={{
          ...btnBase,
          background: "rgba(255,255,255,0.05)",
          color: page <= 1 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.55)",
          cursor: page <= 1 ? "not-allowed" : "pointer",
        }}
        aria-label="이전 페이지"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`e${i}`}
            style={{ ...btnBase, color: "rgba(255,255,255,0.22)", cursor: "default" }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={
              p === page
                ? { ...btnBase, background: "rgba(255,255,255,0.88)", color: "#0c0c0c" }
                : {
                    ...btnBase,
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.42)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }
            }
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        style={{
          ...btnBase,
          background: "rgba(255,255,255,0.05)",
          color: page >= totalPages ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.55)",
          cursor: page >= totalPages ? "not-allowed" : "pointer",
        }}
        aria-label="다음 페이지"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
