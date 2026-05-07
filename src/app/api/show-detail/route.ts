import { type NextRequest, NextResponse } from "next/server";
import type { ShowDetail } from "@/types/show";

const KOPIS_BASE = "https://www.kopis.or.kr/openApi/restful";

function tag(xml: string, name: string): string {
  const re = new RegExp(
    `<${name}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${name}>`,
    "i"
  );
  const m = xml.match(re);
  if (!m) return "";
  return (m[1] ?? m[2] ?? "")
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function blocks(xml: string, wrapper: string): string[] {
  return Array.from(
    xml.matchAll(new RegExp(`<${wrapper}>([\\s\\S]*?)<\\/${wrapper}>`, "g"))
  ).map((m) => m[1]);
}

function isValidKopisPoster(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === "www.kopis.or.kr" && u.pathname.startsWith("/upload/pfm");
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "no_api_key" }, { status: 500 });
  }

  try {
    const url = new URL(`${KOPIS_BASE}/pblprfr/${encodeURIComponent(id)}`);
    url.searchParams.set("service", apiKey);

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 1_800 },
    });
    if (!res.ok) throw new Error(`KOPIS → ${res.status}`);

    const xml = await res.text();
    const db  = blocks(xml, "db")[0] ?? "";

    if (!db) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const rawPoster = tag(db, "poster").replace(/^http:/, "https:");
    const images = blocks(db, "styurl")
      .map((u) => u.trim().replace(/^http:/, "https:"))
      .filter((u) => u.startsWith("https://www.kopis.or.kr/"));

    const detail: ShowDetail = {
      id:        tag(db, "mt20id")    || id,
      title:     tag(db, "prfnm"),
      venue:     tag(db, "fcltynm"),
      venueId:   tag(db, "mt10id")   || undefined,
      startDate: tag(db, "prfpdfrom"),
      endDate:   tag(db, "prfpdto"),
      runtime:   tag(db, "prfruntime"),
      age:       tag(db, "prfage"),
      genre:     tag(db, "genrenm"),
      cast:      tag(db, "prfcast"),
      crew:      tag(db, "prfcrew"),
      company:   tag(db, "entrpsnm"),
      poster:    isValidKopisPoster(rawPoster) ? rawPoster : null,
      state:     tag(db, "prfstate"),
      story:     tag(db, "sty"),
      prices:    tag(db, "pcseguidance"),
      schedule:  tag(db, "dtguidance"),
      area:      tag(db, "area"),
      images:    images.length > 0 ? images : undefined,
    };

    return NextResponse.json(detail, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
