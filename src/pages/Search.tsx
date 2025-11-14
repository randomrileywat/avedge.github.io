import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ListingCard from "../components/ListingCard";
import { searchListings, type ListingDB } from "../lib/db-listings";
import type { Category } from "../types";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = (params.get("category") ?? "All") as Category | "All";
  const state = params.get("state") ?? "";

  const [rows, setRows] = useState<ListingDB[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    searchListings({ q, category, state })
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        if (cancelled) return;
        setErr("Failed to load listings.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, category, state]);

  const results = rows;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="mt-4">
        <SearchBar />
      </div>

      {loading && (
        <p className="mt-6 text-sm text-neutral-600">Loading inventory…</p>
      )}

      {err && (
        <p className="mt-6 text-sm text-red-700">{err}</p>
      )}

      {!loading && !err && (
        <>
          <p className="mt-6 text-sm text-neutral-600">
            {results.length} result{results.length === 1 ? "" : "s"}
            {q && <> for <span className="font-semibold">“{q}”</span></>}
            {state && <> in <span className="font-semibold">{state}</span></>}
          </p>

          <div className="mt-4 grid gap-4">
            {results.map((r) => (
              <ListingCard
                key={r.id}
                item={{
                  id: r.id,
                  make: r.make,
                  model: r.model,
                  category: r.category,
                  quantity: r.quantity,
                  dailyRateUSD: r.daily_rate_usd ?? undefined,
                  locationCity: r.location_city || "",
                  locationState: r.location_state || "",
                  provider: {
                    name: r.provider?.name || "Provider",
                    // You can extend Listing to include provider city/state if you want later
                  },
                  tags: r.tags ?? undefined,
                }}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
