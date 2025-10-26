import type { Listing } from "../types";

export default function ListingCard({ item }: { item: Listing }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{item.make} {item.model}</h3>
        {typeof item.dailyRateUSD === "number" && (
          <span className="text-sm text-neutral-600">${item.dailyRateUSD}/day</span>
        )}
      </div>
      <p className="text-sm text-neutral-600 mt-1">
        {item.category} • {item.locationCity}, {item.locationState} • Qty: {item.quantity ?? "—"}
      </p>
      <p className="mt-2 text-sm">
        <strong>{item.provider.name}</strong>{item.provider.website ? (
          <> • <a className="underline" href={item.provider.website} target="_blank" rel="noreferrer">Website</a></>
        ) : null}
      </p>
      {item.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span key={t} className="rounded-full border px-2 py-1 text-xs">{t}</span>
          ))}
        </div>
      ) : null}
      <div className="mt-4">
        <a
          href={`mailto:rentals@avedge.us?subject=${encodeURIComponent(`${item.make} ${item.model} rental inquiry`)}`}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Request quote
        </a>
      </div>
    </div>
  );
}
