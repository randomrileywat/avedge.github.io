import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ListingCard from "../components/ListingCard";
import { getAllListings, type ListingRow } from "../lib/db-listings";

function filter(rows: ListingRow[], q: string, category: string, state: string) {
  const needle = q.trim().toLowerCase();
  return rows.filter((r) => {
    const inCategory = category === "All" || r.category === (category as any);
    const inState = !state || (r.location_state || "").toLowerCase() === state.toLowerCase();
    const hay = [
      r.make, r.model,
      r.location_city ?? "", r.location_state ?? "",
      ...(r.tags ?? [])
    ].join(" ").toLowerCase();
    const textMatch = !needle || hay.includes(needle);
    return inCategory && inState && textMatch;
  });
}

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "All";
  const state = params.get("state") ?? "";

  const [rows, setRows] = useState<ListingRow[] | null>(null);

  useEffect(() => {
    getAllListings().then(setRows);
  }, []);

  const results = useMemo(
    () => (rows ? filter(rows, q, category, state) : []),
    [rows, q, category, state]
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="mt-4">
        <SearchBar />
      </div>

      {!rows && <p className="mt-6 text-sm text-neutral-600">Loading inventory…</p>}

      {rows && (
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
                  locationCity: r.location_city ?? undefined,
                  locationState: r.location_state ?? undefined,
                  provider: { name: "Provider" }, // (optional: fetch provider by id)
                  tags: r.tags ?? undefined
                }}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
