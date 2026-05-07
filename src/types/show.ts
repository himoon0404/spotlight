export type ShowTheme = "teal" | "emerald" | "amber" | "blue" | "purple" | "red";

export interface SearchShow {
  id: string;
  venueId: string;
  title: string;
  titleSub?: string;
  venue: string;
  region: string;
  area: string;
  genre: string;
  subGenre: string;
  period: string;
  dday?: number;
  ddayLabel?: string;
  isCritical?: boolean;
  isLastChance?: boolean;
  theme: string;
  copy?: string;
  recommendTag?: string;
  viewers?: string;
  metaLevel?: string;
  isCuratorPick?: boolean;
  isHidden: boolean;
  hasEvent: boolean;
  price: number;
  reviewCount: number;
  recommendationReason?: string;
  metaText?: string;
  poster?: string;
  posterUrl?: string;
  saveCount?: number;
}

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
}

export interface ShowDetail {
  id: string;
  title: string;
  venue: string;
  venueId?: string;
  startDate: string;
  endDate: string;
  runtime: string;
  age: string;
  genre: string;
  cast: string;
  crew: string;
  company: string;
  poster?: string | null;
  images?: string[];
  state: string;
  story: string;
  prices: string;
  schedule: string;
  area: string;
}
