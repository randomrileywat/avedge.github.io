import type { Provider } from "../types";

export default function ProviderCard({ p }: { p: Provider }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{p.name}</h3>
        <span className="text-sm text-neutral-600">{p.city}, {p.state}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-700">Categories: {p.categories.join(", ")}</p>
      {p.notes && <p className="mt-1 text-sm text-neutral-600">{p.notes}</p>}
      <div className="mt-3 flex gap-3 text-sm">
        {p.website && <a className="underline" href={p.website} target="_blank" rel="noreferrer">Website</a>}
        {p.phone && <a className="underline" href={`tel:${p.phone.replace(/[^+\d]/g,"")}`}>Call</a>}
        <a className="underline" href={`mailto:rentals@avedge.us?subject=${encodeURIComponent(`Rental inquiry for ${p.name}`)}`}>Email</a>
      </div>
    </div>
  );
}
