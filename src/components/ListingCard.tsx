import type { Listing } from "../types";

export default function ListingCard({ item }: { item: Listing }) {
  const hasLocation = item.locationCity || item.locationState;
  const rate =
    item.dailyRateUSD != null
      ? `$${item.dailyRateUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}/day`
      : "Rate on request";
  const qty =
    item.quantity != null ? `${item.quantity} in inventory` : "Qty not specified";

  return (
    <article className="rounded-2xl border px-4 py-3 shadow-sm bg-white">
      {/* Top line: Make + Model */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">
            {item.make}{" "}
            <span className="font-normal text-neutral-700">{item.model}</span>
          </h2>
          <p className="mt-1 text-xs text-neutral-600">
            {item.category}
            {hasLocation && (
              <>
                {" · "}
                {item.locationCity}
                {item.locationCity && item.locationState && ", "}
                {item.locationState}
              </>
            )}
          </p>
        </div>

        {/* Rate pill */}
        <div className="ml-auto rounded-full border px-2 py-1 text-[11px] text-neutral-800">
          {rate}
        </div>
      </div>

      {/* Provider */}
      <div className="mt-2 text-xs text-neutral-700">
        <span className="font-medium">{item.provider.name}</span>
      </div>

      {/* Quantity */}
      <div className="mt-1 text-xs text-neutral-600">
        {qty}
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border px-2 py-0.5 text-[11px] text-neutral-700 bg-neutral-50"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
