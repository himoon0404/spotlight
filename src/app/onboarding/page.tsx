"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserPrefs } from "@/lib/userPrefs";

const ALL_GENRES = ["뮤지컬", "연극", "재즈", "클래식", "인디음악", "무용", "전통예술"];
const GENRE_EMOJI: Record<string, string> = {
  뮤지컬: "🎭", 연극: "🎪", 재즈: "🎷", 클래식: "🎻",
  인디음악: "🎸", 무용: "💃", 전통예술: "🪷",
};
const ALL_REGIONS = [
  "서울", "인천", "경기", "강원",
  "충북", "충남", "세종", "대전",
  "전북", "전남", "광주",
  "경북", "대구", "경남", "부산", "울산",
  "제주",
];

const FEATURES = [
  { icon: "🗺️", title: "지도에서 탐색",  desc: "내 근처 공연장을 지도로 한눈에" },
  { icon: "⏰", title: "D-day 알림",     desc: "놓치기 아까운 마감 임박 공연" },
  { icon: "✦",  title: "장르 맞춤 추천", desc: "취향에 맞는 공연만 골라서" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]             = useState<0 | 1>(0);
  const [name, setName]             = useState("");
  const [selectedGenres, setGenres] = useState<string[]>([]);
  const [selectedRegion, setRegion] = useState("서울");

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function finish() {
    setUserPrefs({
      name:      name.trim() || "관람객",
      genres:    selectedGenres,
      region:    selectedRegion,
      onboarded: true,
    });
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0c0c0c", color: "#ffffff" }}>

      {/* ── Step 0: 인트로 ────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="flex-1 flex flex-col px-7 pt-20 pb-10">

          {/* 로고 */}
          <div className="flex items-center gap-2 mb-14">
            <span className="w-2 h-2 rounded-full bg-amber-400" style={{ boxShadow: "0 0 8px 2px rgba(251,191,36,0.5)" }} />
            <span className="text-[15px] font-black tracking-[0.28em] text-white">SPOTLIGHT</span>
          </div>

          {/* 헤드라인 */}
          <div className="flex-1">
            <p className="text-[13px] font-medium tracking-wider mb-3" style={{ color: "rgba(251,191,36,0.7)" }}>
              공연 발견 플랫폼
            </p>
            <h1 className="text-[34px] font-black leading-[1.2] text-white mb-5">
              공연을 더<br />쉽게 발견하다
            </h1>
            <p className="text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
              지도, 장르, D-day로<br />나에게 맞는 공연을 찾아보세요
            </p>

            {/* 기능 미리보기 */}
            <div className="mt-12 flex flex-col gap-3.5">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-center gap-4">
                  <div
                    className="flex-none w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white">{f.title}</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 rounded-2xl text-[15px] font-black tracking-wide text-black"
              style={{ background: "#fbbf24" }}
            >
              관심사 설정하고 시작하기
            </button>
            <button
              onClick={finish}
              className="w-full py-3 text-[13px] font-semibold"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              설정 건너뛰기 →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: 이름 + 장르 + 지역 ──────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col px-7 pt-14 pb-10 min-h-screen">

          {/* 진행 바 */}
          <div className="flex gap-1.5 mb-10">
            <div className="flex-1 h-1 rounded-full" style={{ background: "#fbbf24" }} />
          </div>

          <p className="text-[12px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "rgba(251,191,36,0.6)" }}>
            취향 설정
          </p>
          <h2 className="text-[24px] font-black text-white mb-1.5">나를 알려주세요</h2>
          <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>모두 선택하지 않아도 됩니다</p>

          {/* 이름 입력 */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 (선택)"
            maxLength={10}
            className="w-full rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/25 outline-none mb-8"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />

          {/* 장르 선택 */}
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            관심 장르 (복수 선택)
          </p>
          <div className="grid grid-cols-4 gap-2.5 mb-8">
            {ALL_GENRES.map((g) => {
              const active = selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all"
                  style={active
                    ? { background: "rgba(251,191,36,0.14)", border: "1.5px solid rgba(251,191,36,0.55)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  <span className="text-xl leading-none">{GENRE_EMOJI[g]}</span>
                  <span className="text-[9px] font-bold" style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.55)" }}>
                    {g.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 지역 선택 */}
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            주로 가는 지역
          </p>
          <div className="flex flex-wrap gap-2.5 mb-10">
            {ALL_REGIONS.map((r) => {
              const active = selectedRegion === r;
              return (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className="px-4 py-2 rounded-full text-[12px] font-bold transition-all"
                  style={active
                    ? { background: "#fbbf24", color: "#0c0c0c" }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }
                  }
                >
                  {r}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={finish}
              className="w-full py-4 rounded-2xl text-[15px] font-black tracking-wide text-black"
              style={{ background: "#fbbf24" }}
            >
              SPOTLIGHT 시작하기 ✦
            </button>
            <button
              onClick={() => setStep(0)}
              className="w-full py-2 text-[12px]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              이전으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
