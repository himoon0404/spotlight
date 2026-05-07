export interface UserPrefs {
  name: string;
  genres: string[];
  region: string;
  subRegion?: string; // specific city within province (e.g. "전주" within "전북")
  onboarded: boolean;
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
