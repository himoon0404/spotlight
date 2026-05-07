"use client";

import { useState, useMemo, useEffect } from "react";
import type { SearchShow } from "@/types/show";

export function useVenueFilter(shows: SearchShow[]) {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  // Reset selection when the show list changes (genre/region switch)
  useEffect(() => {
    setSelectedVenue(null);
  }, [shows]);

  // Unique venues sorted by frequency descending
  const venues = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of shows) {
      counts.set(s.venue, (counts.get(s.venue) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [shows]);

  const venueFiltered = useMemo(
    () => (selectedVenue ? shows.filter((s) => s.venue === selectedVenue) : shows),
    [shows, selectedVenue]
  );

  return { venues, selectedVenue, setSelectedVenue, venueFiltered };
}
