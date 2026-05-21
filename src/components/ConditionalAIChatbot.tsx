"use client";

import { usePathname } from "next/navigation";
import { AIChatbot } from "@/components/AIChatbot";

const HIDDEN_PATHS = ["/onboarding"];

export function ConditionalAIChatbot() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;
  return <AIChatbot />;
}
