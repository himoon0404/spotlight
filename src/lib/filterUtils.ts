import type { SearchShow } from "./searchMockData";

export interface SearchFilters {
  keyword: string;
  region: string | null;
  venueId: string | null;
  genre: string | null;
  subGenre: string | null;
  extraTags: string[];
}

export function filterShows(shows: SearchShow[], filters: SearchFilters): SearchShow[] {
  const { keyword, region, venueId, genre, subGenre, extraTags } = filters;

  return shows.filter((show) => {
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const hit =
        show.title.toLowerCase().includes(q) ||
        show.venue.toLowerCase().includes(q) ||
        show.genre.toLowerCase().includes(q) ||
        show.area.toLowerCase().includes(q) ||
        show.region.toLowerCase().includes(q) ||
        show.subGenre.toLowerCase().includes(q) ||
        (show.titleSub?.toLowerCase().includes(q) ?? false);
      if (!hit) return false;
    }

    if (region  && show.region  !== region)  return false;
    if (venueId && show.venueId !== venueId) return false;
    if (genre   && show.genre   !== genre)   return false;
    if (subGenre && show.subGenre !== subGenre) return false;

    if (extraTags.includes("마감 임박")      && (!show.dday || show.dday > 3)) return false;
    if (extraTags.includes("숨은 공연")      && !show.isHidden)                return false;
    if (extraTags.includes("리뷰 많은 공연") && show.reviewCount < 50)         return false;
    if (extraTags.includes("가격 낮은 공연") && show.price > 40_000)           return false;
    if (extraTags.includes("이벤트 있음")    && !show.hasEvent)                return false;

    return true;
  });
}

export function hasActiveFilters(f: SearchFilters): boolean {
  return (
    f.keyword.trim().length > 0 ||
    f.region  !== null ||
    f.venueId !== null ||
    f.genre   !== null ||
    f.subGenre !== null ||
    f.extraTags.length > 0
  );
}

export function getSimilarShows(shows: SearchShow[], genre: string | null, n = 3): SearchShow[] {
  const pool = genre
    ? shows.filter((s) => s.genre === genre)
    : shows.filter((s) => s.isHidden || s.isCuratorPick);
  return pool.slice(0, n);
}
