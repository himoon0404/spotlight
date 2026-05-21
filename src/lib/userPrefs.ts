export interface NotificationPrefs {
  bookingOpen: boolean;
  lastChance: boolean;
  newArtistShow: boolean;
  nearbyShow: boolean;
  moodRec: boolean;
}

export interface TasteScorePrefs {
  emotional: number;
  stimulation: number;
  story: number;
  performance: number;
  solo: number;
  social: number;
  classic: number;
  experimental: number;
}

export interface UserPrefs {
  name: string;
  genres: string[];
  region: string;
  subRegion?: string;
  venueId?: string;
  venueName?: string;
  onboarded: boolean;
  artists?: string[];
  notifications?: NotificationPrefs;
  hasCompletedTasteTest?: boolean;
  tasteType?: string;
  tasteScores?: TasteScorePrefs;
  tasteCompletedAt?: string;
}

const KEY = "spotlight_prefs";

export function getUserPrefs(): UserPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserPrefs) : null;
  } catch {
    return null;
  }
}

export function setUserPrefs(prefs: UserPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(prefs));
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  const p = getUserPrefs();
  return p?.onboarded === true;
}
