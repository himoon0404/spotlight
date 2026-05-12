"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ f }: { f: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function SearchIcon({ f }: { f: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={f ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function HeartIcon({ f }: { f: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function UserIcon({ f }: { f: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={f ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" fill={f ? "currentColor" : "none"} />
    </svg>
  );
}

const TABS = [
  { id: "home",     label: "홈",   href: "/",      icon: (f: boolean) => <HomeIcon   f={f} /> },
  { id: "search",   label: "검색", href: "/search", icon: (f: boolean) => <SearchIcon f={f} /> },
  { id: "wishlist", label: "관심", href: "#",       icon: (f: boolean) => <HeartIcon  f={f} /> },
  { id: "my",       label: "마이", href: "/guardian", icon: (f: boolean) => <UserIcon   f={f} /> },
] as const;

export function Navigation() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) return null;

  const activeId =
    pathname === "/" ? "home" :
    pathname.startsWith("/search") ? "search" :
    pathname.startsWith("/guardian") ? "my" :
    null;

  const isMapPage = pathname.startsWith("/map");

  return (
    <>
      {/* 모바일: 하단 바 (지도 페이지·PC에서 숨김) */}
      {!isMapPage && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0c]"
          style={{ height: 76, borderTop: "1px solid rgba(255,255,255,0.055)" }}
        >
          <div className="grid grid-cols-4 h-full">
            {TABS.map((tab) => {
              const active = tab.id === activeId;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    active ? "text-white" : "text-white/25"
                  }`}
                >
                  {tab.icon(active)}
                  <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* PC: 좌측 사이드바 */}
      <nav
        className="hidden lg:flex fixed left-0 top-0 bottom-0 flex-col z-50 bg-[#0c0c0c]"
        style={{ width: 240, borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* 로고 */}
        <div className="flex items-center gap-2.5 px-6 pt-7 pb-8">
          <span
            className="w-2 h-2 rounded-full bg-amber-400 flex-none"
            style={{ boxShadow: "0 0 8px 2px rgba(251,191,36,0.45)" }}
          />
          <span className="text-[17px] font-black tracking-[0.22em] text-white select-none">
            SPOTLIGHT
          </span>
        </div>

        {/* 메뉴 */}
        <div className="flex flex-col gap-0.5 px-3 flex-1">
          {TABS.map((tab) => {
            const active = tab.id === activeId;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {tab.icon(active)}
                <span className="text-[14px] font-semibold">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
