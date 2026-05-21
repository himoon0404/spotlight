"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  TASTE_QUESTIONS,
  INITIAL_SCORES,
  calculateTasteType,
  type TasteScores,
  type TasteTypeResult,
} from "@/lib/tasteTestService";
import { getUserPrefs, setUserPrefs } from "@/lib/userPrefs";
import { TasteTestWelcome } from "@/components/taste-test/TasteTestWelcome";
import { TasteTestQuestion } from "@/components/taste-test/TasteTestQuestion";
import { TasteTestCalculating } from "@/components/taste-test/TasteTestCalculating";
import { TasteTestResult } from "@/components/taste-test/TasteTestResult";
import type { ProcessedShow } from "@/types/show";
import "./taste-test.css";

type Phase = "welcome" | "questions" | "calculating" | "result";

export default function TasteTestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<TasteScores>({ ...INITIAL_SCORES });
  const [selectedIdx, setSelectedIdx] = useState<0 | 1 | null>(null);
  const [visible, setVisible] = useState(true);
  const [result, setResult] = useState<TasteTypeResult | null>(null);
  const [shows, setShows] = useState<ProcessedShow[]>([]);
  const [showsLoading, setShowsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const progress = Math.round((currentQ / TASTE_QUESTIONS.length) * 100);

  function fadeTransition(nextFn: () => void) {
    setVisible(false);
    setTimeout(() => {
      nextFn();
      setVisible(true);
    }, 300);
  }

  function handleSkip() {
    const prefs = getUserPrefs();
    if (prefs) setUserPrefs({ ...prefs, hasCompletedTasteTest: false });
    router.push("/");
  }

  function handleStart() {
    fadeTransition(() => setPhase("questions"));
  }

  function handleSelectOption(idx: 0 | 1) {
    if (selectedIdx !== null) return;

    const q = TASTE_QUESTIONS[currentQ];
    const chosen = q.options[idx];
    const newScores: TasteScores = {
      ...scores,
      [chosen.trait]: scores[chosen.trait] + chosen.score,
    };

    setSelectedIdx(idx);

    setTimeout(() => {
      const isLastQuestion = currentQ + 1 >= TASTE_QUESTIONS.length;

      if (isLastQuestion) {
        const typeResult = calculateTasteType(newScores);
        setScores(newScores);
        setResult(typeResult);

        fadeTransition(() => {
          setPhase("calculating");
          setTimeout(() => {
            fadeTransition(() => {
              setPhase("result");
              fetchShows(typeResult);
              saveResult(newScores, typeResult);
            });
          }, 2400);
        });
      } else {
        setScores(newScores);
        fadeTransition(() => {
          setCurrentQ((prev) => prev + 1);
          setSelectedIdx(null);
        });
      }
    }, 650);
  }

  async function fetchShows(typeResult: TasteTypeResult) {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setShowsLoading(true);

    try {
      const prefs = getUserPrefs();
      const area = prefs?.region || "서울";
      const genre = typeResult.recommendedGenres[0];

      const qs = new URLSearchParams({ genres: genre, area });
      const res = await fetch(`/api/genre?${qs.toString()}`, {
        signal: abortRef.current.signal,
      });

      if (res.ok) {
        const data: Record<string, ProcessedShow[]> = await res.json();
        const flat = Object.values(data).flat().slice(0, 6);
        setShows(flat);
      }
    } catch {
      // AbortError or network failure — show empty state
    } finally {
      setShowsLoading(false);
    }
  }

  function saveResult(s: TasteScores, typeResult: TasteTypeResult) {
    const prefs = getUserPrefs();
    if (!prefs) return;
    setUserPrefs({
      ...prefs,
      hasCompletedTasteTest: true,
      tasteType: typeResult.id,
      tasteScores: s,
      tasteCompletedAt: new Date().toISOString(),
    });
  }

  function handleRetake() {
    fadeTransition(() => {
      setPhase("welcome");
      setCurrentQ(0);
      setScores({ ...INITIAL_SCORES });
      setSelectedIdx(null);
      setResult(null);
      setShows([]);
    });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0c0c0c", color: "#fff" }}>
      {/* Transition wrapper */}
      <div
        className="flex-1 flex flex-col w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        {phase === "welcome" && (
          <TasteTestWelcome onStart={handleStart} onSkip={handleSkip} />
        )}

        {phase === "questions" && (
          <TasteTestQuestion
            key={currentQ}
            question={TASTE_QUESTIONS[currentQ]}
            questionNumber={currentQ + 1}
            total={TASTE_QUESTIONS.length}
            progress={progress}
            selectedIdx={selectedIdx}
            onSelect={handleSelectOption}
          />
        )}

        {phase === "calculating" && <TasteTestCalculating />}

        {phase === "result" && result && (
          <TasteTestResult
            result={result}
            shows={shows}
            showsLoading={showsLoading}
            onGoHome={() => router.push("/")}
            onRetake={handleRetake}
          />
        )}
      </div>
    </div>
  );
}
