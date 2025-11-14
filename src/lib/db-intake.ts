import { supabase } from "./supabase";
import type { Category } from "../types";

export type ProviderIntakeRow = {
  id: string;
  user_id: string | null;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  categories: Category[] | null;
  notes: string | null;
  status: string;
  created_at: string;
};

/**
 * Fetch intake rows that still need review.
 */
export async function getPendingIntake(): Promise<ProviderIntakeRow[]> {
  const { data, error } = await supabase
    .from("provider_intake")
    .select("*")
    .in("status", ["new", "reviewing"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPendingIntake error", error);
    return [];
  }
  return (data ?? []) as ProviderIntakeRow[];
}

/**
 * Approve an intake row by:
 *  1. Creating a providers row
 *  2. Optionally linking user_id -> provider_id in provider_users
 *  3. Updating intake status to 'approved'
 */
export async function approveIntake(intakeId: string) {
  // Load that intake row
  const { data: intake, error: loadErr } = await supabase
    .from("provider_intake")
    .select("*")
    .eq("id", intakeId)
    .single();

  if (loadErr || !intake) {
    throw new Error(loadErr?.message ?? "Intake not found");
  }

  // 1) Create provider
  const { data: provider, error: provErr } = await supabase
    .from("providers")
    .insert({
      name: intake.company_name,
      website: intake.website,
      phone: intake.phone,
      city: intake.city,
      state: intake.state,
      categories: intake.categories ?? [],
    })
    .select("*")
    .single();

  if (provErr || !provider) {
    throw new Error(provErr?.message ?? "Failed to create provider");
  }

  // 2) Optionally link user_id, if present
  if (intake.user_id) {
    const { error: linkErr } = await supabase.from("provider_users").insert({
      user_id: intake.user_id,
      provider_id: provider.id,
    });
    if (linkErr) {
      console.error("provider_users link error", linkErr);
      // not fatal for approval; carry on
    }
  }

  // 3) Update intake status
  const { error: statusErr } = await supabase
    .from("provider_intake")
    .update({ status: "approved" })
    .eq("id", intakeId);

  if (statusErr) {
    console.error("Failed to update intake status", statusErr);
  }

  return { provider, intake };
}

/**
 * Optional: mark an intake as 'reviewing' or 'rejected'
 */
export async function updateIntakeStatus(id: string, status: string) {
  const { error } = await supabase
    .from("provider_intake")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
