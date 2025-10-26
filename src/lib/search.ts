import data from "../data/listings.json";
import type { Listing, Category } from "../types";

export type SearchParams = {
  q?: string;
  category?: Category | "All";
  state?: string; // "OK", "TX", etc.
};

export function searchListings({ q = "", category = "All", state = "" }: SearchParams): Listing[] {
  const needle = q.trim().toLowerCase();
  return (data as Listing[]).filter((item) => {
    const inCategory = category === "All" || item.category === category;
    const inState = !state || item.locationState.toLowerCase() === state.toLowerCase();

    const hay = [
      item.make,
      item.model,
      item.provider.name,
      item.locationCity,
      item.locationState,
      ...(item.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    const textMatch = !needle || hay.includes(needle);
    return inCategory && inState && textMatch;
  });
}
