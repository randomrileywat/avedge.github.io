import { supabase } from "./supabase";
import type { Category } from "../types";

export type ListingDB = {
  id: string;
  provider_id: string;
  make: string;
  model: string;
  category: Category;
  quantity: number;
  daily_rate_usd: number | null;
  location_city: string | null;
  location_state: string | null;
  tags: string[] | null;
  provider: {
    id: string;
    name: string | null;
    city: string | null;
    state: string | null;
  } | null;
};

export type ListingsSearchParams = {
  q?: string;
  category?: Category | "All";
  state?: string;
};

export async function searchListings(params: ListingsSearchParams): Promise<ListingDB[]> {
  const { q = "", category = "All", state = "" } = params;
  let query = supabase
  .from("listings")
  .select(
    `
      id,
      provider_id,
      make,
      model,
      category,
      quantity,
      daily_rate_usd,
      location_city,
      location_state,
      tags,
      is_hidden,
      is_boosted,
      provider:providers (
        id,
        name,
        city,
        state
      )
    `
  )
  .eq("is_hidden", false);

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (state) {
    query = query.eq("location_state", state.toUpperCase());
  }

  const trimmed = q.trim();
  if (trimmed) {
    // Text search on make, model, and city
    // Supabase 'or' syntax: col.ilike.%term%,othercol.ilike.%term%
    const term = trimmed.replace(/%/g, ""); // basic sanitize for %
    query = query.or(
      `make.ilike.%${term}%,model.ilike.%${term}%,location_city.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase search error:", error);
    return [];
  }

  return (data ?? []) as unknown as ListingDB[];
}
