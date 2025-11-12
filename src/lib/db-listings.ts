import { supabase } from "./supabase";

export type ListingRow = {
  id: string;
  provider_id: string;
  make: string;
  model: string;
  category: "Audio"|"Video"|"Lighting"|"Networking"|"Rigging";
  quantity: number;
  daily_rate_usd: number | null;
  location_city: string | null;
  location_state: string | null;
  tags: string[] | null;
};

export async function getAllListings(): Promise<ListingRow[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*");
  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  return data as ListingRow[];
}
