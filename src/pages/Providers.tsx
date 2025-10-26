import providers from "../data/providers.json";
import ProviderCard from "../components/ProviderCard";
import type { Provider } from "../types";
import { useState } from "react";

export default function Providers() {
  const [state, setState] = useState("");
  const [q, setQ] = useState("");

  const filtered = (providers as Provider[]).filter((p) => {
    const stateOk = !state || p.state.toLowerCase() === state.toLowerCase();
    const needle = q.trim().toLowerCase();
    const hay = [p.name, p.city, p.state, ...(p.categories || [])].join(" ").toLowerCase();
    const textOk = !needle || hay.includes(needle);
    return stateOk && textOk;
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Providers</h1>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search providers or cities"
          className="w-full rounded-xl border px-4 py-3"
        />
        <input
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase().slice(0,2))}
          placeholder="State (OK, TX)"
          className="w-28 rounded-xl border px-3 py-3"
        />
      </div>

      <p className="mt-6 text-sm text-neutral-600">{filtered.length} provider{filtered.length===1?"":"s"}</p>

      <div className="mt-4 grid gap-4">
        {filtered.map((p) => <ProviderCard key={p.id} p={p} />)}
      </div>
    </main>
  );
}
