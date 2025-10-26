import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { searchListings } from "../lib/search";
import ListingCard from "../components/ListingCard";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = (params.get("category") ?? "All") as any;
  const state = params.get("state") ?? "";

  const results = searchListings({ q, category, state });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="mt-4">
        <SearchBar />
      </div>

      <p className="mt-6 text-sm text-neutral-600">
        {results.length} result{results.length === 1 ? "" : "s"}
        {q && <> for <span className="font-semibold">“{q}”</span></>}
        {state && <> in <span className="font-semibold">{state}</span></>}
      </p>

      <div className="mt-4 grid gap-4">
        {results.map((item) => <ListingCard key={item.id} item={item} />)}
      </div>
    </main>
  );
}
