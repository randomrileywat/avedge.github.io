// src/components/ListingCard.tsx
import type { Listing } from "../types";

export default function ListingCard({ item }: { item: Listing }) {
  return (
    <div className="rounded-xl border p-4">
      {/* ...other stuff... */}
      {item.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t: string) => (
            <span key={t} className="rounded-full border px-2 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
      ) : null}
      {/* ... */}
    </div>
  );
}
