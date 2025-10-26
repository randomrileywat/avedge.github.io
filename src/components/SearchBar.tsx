import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SearchBar() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "All");
  const [state, setState] = useState(params.get("state") ?? "");
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category && category !== "All") sp.set("category", category);
    if (state) sp.set("state", state);
    navigate(`/search?${sp.toString()}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try: 'Barco E2' or 'LA12X'"
        className="w-full rounded-xl border px-4 py-3"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-xl border px-3 py-3"
      >
        {["All", "Audio", "Video", "Lighting", "Networking", "Rigging"].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input
        value={state}
        onChange={(e) => setState(e.target.value.toUpperCase().slice(0,2))}
        placeholder="State (OK, TX)"
        className="w-28 rounded-xl border px-3 py-3"
      />
      <button className="rounded-xl border px-5 py-3">Search</button>
    </form>
  );
}
