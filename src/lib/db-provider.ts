import { supabase } from "./supabase";
import type { Category } from "../types";

export type ProviderRow = {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  categories: Category[] | null;
};

export type ProviderListingRow = {
  id: string;
  make: string;
  model: string;
  category: Category;
  quantity: number;
  daily_rate_usd: number | null;
  location_city: string | null;
  location_state: string | null;
  tags: string[] | null;
  created_at: string;
  is_hidden: boolean;
  is_boosted: boolean;
};

export async function getCurrentProviderWithListings(userId: string) {
  // 1) find provider_id from provider_users
  const { data: link, error: linkErr } = await supabase
    .from("provider_users")
    .select("provider_id")
    .eq("user_id", userId)
    .single();

  if (linkErr || !link) {
    return {
      provider: null as ProviderRow | null,
      listings: [] as ProviderListingRow[],
      error: linkErr?.message ?? "No provider linked to this user.",
    };
  }

  const providerId = link.provider_id as string;

  // 2) load provider info
  const { data: provider, error: provErr } = await supabase
    .from("providers")
    .select("*")
    .eq("id", providerId)
    .single();

  if (provErr || !provider) {
    return {
      provider: null,
      listings: [],
      error: provErr?.message ?? "Provider not found.",
    };
  }

  // 3) load listings for that provider
  const { data: listings, error: listErr } = await supabase
    .from("listings")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  if (listErr) {
    return {
      provider: provider as ProviderRow,
      listings: [],
      error: listErr.message,
    };
  }

  return {
    provider: provider as ProviderRow,
    listings: (listings ?? []) as ProviderListingRow[],
    error: null,
  };
}

export async function getAllProviders(): Promise<ProviderRow[]> {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("state", { ascending: true })
    .order("city", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase providers error:", error);
    return [];
  }

  return (data ?? []) as ProviderRow[];
}
