export interface FavoriteShow {
  id: string;
  title: string;
  genre: string;
  venue: string;
  posterUrl?: string;
  theme: string;
  period?: string;
  area?: string;
}

const KEY = "spotlight_favorites";

export function getFavorites(): FavoriteShow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavoriteShow[]) : [];
  } catch {
    return [];
  }
}

export function setFavorites(list: FavoriteShow[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export function toggleFavorite(show: FavoriteShow): boolean {
  const list = getFavorites();
  const idx = list.findIndex((f) => f.id === show.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    setFavorites(list);
    return false;
  }
  list.unshift(show);
  setFavorites(list);
  return true;
}
