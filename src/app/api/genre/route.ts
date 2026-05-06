import { NextRequest, NextResponse } from "next/server";
import { fetchShowsByGenre, GENRE_SHCATE } from "@/lib/kopis";
import type { ProcessedShow } from "@/types/show";

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) return NextResponse.json({});

  const genresParam = req.nextUrl.searchParams.get("genres") ?? "";
  const genres = genresParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5);
  if (!genres.length) return NextResponse.json({});

  // Group genres by shcate — genres sharing the same code (e.g. 재즈+인디음악 → CCCD)
  // are merged into one fetch and returned under a combined label like "재즈 · 인디음악".
  const shcateToGenres = new Map<string, string[]>();
  for (const genre of genres) {
    const shcate = GENRE_SHCATE[genre];
    if (!shcate) continue;
    const list = shcateToGenres.get(shcate) ?? [];
    list.push(genre);
    shcateToGenres.set(shcate, list);
  }

  const settled = await Promise.allSettled(
    Array.from(shcateToGenres.entries()).map(async ([shcate, genreList]) => {
      const shows = await fetchShowsByGenre(apiKey, shcate);
      const label = genreList.join(" · ");
      return [label, shows] as [string, ProcessedShow[]];
    })
  );

  // Include all labels in the response, even empty — client renders an empty-state section.
  const payload: Record<string, ProcessedShow[]> = {};
  for (const r of settled) {
    if (r.status === "fulfilled") {
      const [label, shows] = r.value;
      payload[label] = shows;
    }
  }

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
  });
}
