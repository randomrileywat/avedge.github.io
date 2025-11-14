import { useEffect, useState } from "react";
import { getAllProviders, type ProviderRow } from "../lib/db-provider";
import type { Category } from "../types";

export default function Providers() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filterState, setFilterState] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    getAllProviders()
      .then((rows) => {
        if (cancelled) return;
        setProviders(rows);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        if (cancelled) return;
        setErr("Failed to load providers.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = providers.filter((p) => {
    const stateOk =
      !filterState ||
      (p.state || "").toUpperCase() === filterState.toUpperCase();

    const catOk =
      filterCategory === "All" ||
      (p.categories ?? []).includes(filterCategory);

    return stateOk && catOk;
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Providers</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Browse rental providers registered on AV Edge. Filter by region and specialty to find the best fit for your project.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <div>
          <label className="block text-xs font-medium text-neutral-600">
            State (2-letter)
          </label>
          <input
            value={filterState}
            onChange={(e) => setFilterState(e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="OK"
            className="mt-1 rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | "All")}
            className="mt-1 rounded-xl border px-3 py-2 text-sm"
          >
            <option value="All">All</option>
            <option value="Audio">Audio</option>
            <option value="Video">Video</option>
            <option value="Lighting">Lighting</option>
            <option value="Networking">Networking</option>
            <option value="Rigging">Rigging</option>
          </select>
        </div>
      </div>

      {/* Status */}
      {loading && (
        <p className="mt-6 text-sm text-neutral-600">Loading providers…</p>
      )}
      {err && (
        <p className="mt-6 text-sm text-red-700">{err}</p>
      )}

      {/* List */}
      {!loading && !err && (
        <>
          <p className="mt-6 text-sm text-neutral-600">
            {filtered.length} provider{filtered.length === 1 ? "" : "s"} found
          </p>
          <div className="mt-4 grid gap-3">
            {filtered.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function ProviderCard({ provider }: { provider: ProviderRow }) {
  const locationPieces = [
    provider.city || undefined,
    provider.state || undefined,
  ].filter(Boolean);
  const location = locationPieces.join(", ");

  return (
    <article className="rounded-2xl border px-4 py-3 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{provider.name}</h2>
          <p className="mt-1 text-xs text-neutral-600">
            {location || "Location not set"}
          </p>
          {provider.categories?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {provider.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border px-2 py-0.5 text-[11px] bg-neutral-50 text-neutral-700"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-neutral-500">
              Categories not set
            </p>
          )}
        </div>

        {provider.website && (
          <a
            href={provider.website}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-xs underline"
          >
            Visit site
          </a>
        )}
      </div>

      {provider.phone && (
        <p className="mt-2 text-xs text-neutral-700">{provider.phone}</p>
      )}
    </article>
  );
}
