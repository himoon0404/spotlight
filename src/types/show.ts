export type ShowTheme = "teal" | "emerald" | "amber" | "blue" | "purple" | "red";

export interface CardShow {
  id: string;
  title: string;
  genre: string;
  venue: string;
  posterUrl?: string;
  theme: string;
  rank?: number;
  dday?: number;
  ddayLabel?: string;
  isCritical?: boolean;
}

export interface ProcessedShow extends CardShow {
  theme: ShowTheme;
  titleSub?: string;
  titleEn?: string;
  period: string;
  running?: string;
  area: string;
  viewers?: string;
  copy?: string;
  badges?: string[];
  recommendReason?: string;
  meta?: string;
}

export interface ShowsPayload {
  popular: ProcessedShow[];
  lastChance: ProcessedShow[];
  hidden: ProcessedShow[];
  nearby: ProcessedShow[];
  isMock?: boolean;
}
