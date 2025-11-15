import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { getCurrentProviderWithListings, type ProviderRow, type ProviderListingRow } from "../lib/db-provider";
import { supabase } from "../lib/supabase";
import type { Category, UploadRowRaw, ListingNormalized } from "../types";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeRow, validateRows, type RowIssue } from "../lib/inventory";

const CATEGORIES: Category[] = ["Audio","Video","Lighting","Networking","Rigging"];

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [provider, setProvider] = useState<ProviderRow | null>(null);
  const [listings, setListings] = useState<ProviderListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<Category>("Audio");
  const [quantity, setQuantity] = useState("1");
  const [dailyRate, setDailyRate] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [tags, setTags] = useState("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);

    getCurrentProviderWithListings(user.id)
      .then(({ provider, listings, error }) => {
        if (cancelled) return;
        setProvider(provider);
        setListings(listings);
        if (error) setErr(error);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error(e);
        setErr("Failed to load provider data.");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  if (authLoading) {
    return <main className="px-6 py-12">Loading…</main>;
  }
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  async function handleAddListing(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) {
      setSaveMsg("No provider linked to this user.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);

    try {
      const qtyNum = Number(quantity || 0);
      const rateNum = dailyRate ? Number(dailyRate) : null;
      const tagArr = tags
        ? tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean)
        : [];

      const { data, error } = await supabase
        .from("listings")
        .insert({
          provider_id: provider.id,
          make,
          model,
          category,
          quantity: qtyNum,
          daily_rate_usd: rateNum,
          location_city: city || null,
          location_state: state || null,
          tags: tagArr,
        })
        .select("*")
        .single();

      if (error) {
        console.error(error);
        setSaveMsg(`Error: ${error.message}`);
      } else {
        setSaveMsg("Listing added.");
        // Prepend new listing to table
        setListings((prev) => [data as ProviderListingRow, ...prev]);
        // Reset minimal fields
        setModel("");
      }
    } catch (e: any) {
      setSaveMsg(`Error: ${e?.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  const [listBusyId, setListBusyId] = useState<string | null>(null);

  async function toggleHidden(listing: ProviderListingRow) {
    setListBusyId(listing.id);
    try {
      const { data, error } = await supabase
        .from("listings")
        .update({ is_hidden: !listing.is_hidden })
        .eq("id", listing.id)
        .select("*")
        .single();

      if (error) {
        console.error(error);
        setSaveMsg?.(`Error hiding listing: ${error.message}`);
      } else {
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? (data as ProviderListingRow) : l))
        );
      }
    } finally {
      setListBusyId(null);
    }
  }

  async function toggleBoost(listing: ProviderListingRow) {
    setListBusyId(listing.id);
    try {
      const { data, error } = await supabase
        .from("listings")
        .update({ is_boosted: !listing.is_boosted })
        .eq("id", listing.id)
        .select("*")
        .single();

      if (error) {
        console.error(error);
        setSaveMsg?.(`Error boosting listing: ${error.message}`);
      } else {
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? (data as ProviderListingRow) : l))
        );
      }
    } finally {
      setListBusyId(null);
    }
  }

  async function removeListing(listing: ProviderListingRow) {
    if (!window.confirm(`Remove ${listing.make} ${listing.model} from your listings?`)) {
      return;
    }
    setListBusyId(listing.id);
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id);

      if (error) {
        console.error(error);
        setSaveMsg?.(`Error removing listing: ${error.message}`);
      } else {
        setListings((prev) => prev.filter((l) => l.id !== listing.id));
      }
    } finally {
      setListBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Provider Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Signed in as <strong>{user.email}</strong>
          </p>
        </div>
        <button onClick={signOut} className="rounded-xl border px-4 py-2 text-sm">
          Sign out
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-neutral-600">Loading provider data…</p>}

      {!loading && provider && (
        <>
          {/* Provider profile */}
          <section className="mt-8 rounded-2xl border p-4">
            <h2 className="text-lg font-semibold">Provider profile</h2>
            <p className="mt-1 text-sm">{provider.name}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {provider.city || "City unknown"}, {provider.state || "State unknown"}
            </p>
            {provider.categories?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {provider.categories.map((c) => (
                  <span key={c} className="rounded-full border px-2 py-1 text-xs">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-2 text-sm">
              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noreferrer"
                  className="underline mr-3"
                >
                  Website
                </a>
              )}
              {provider.phone && <span>{provider.phone}</span>}
            </div>
          </section>

          {/* Add Listing */}
          <section className="mt-8 rounded-2xl border p-4">
            <h2 className="text-lg font-semibold">Add listing</h2>
            <form onSubmit={handleAddListing} className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Make</label>
                <input
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Model</label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Daily rate (USD)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">State (2-letter)</label>
                <input
                  value={state}
                  maxLength={2}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium">Tags (comma or semicolon separated)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div className="md:col-span-4 flex items-center gap-3">
                <button
                  disabled={saving}
                  className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Add listing"}
                </button>
                {saveMsg && <span className="text-sm text-neutral-700">{saveMsg}</span>}
              </div>
            </form>
          </section>

          {/* My Listings */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">My listings</h2>
            {listings.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">
                No listings yet. Add your first one above.
              </p>
              ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 pr-4">Make</th>
                      <th className="text-left py-2 pr-4">Model</th>
                      <th className="text-left py-2 pr-4">Category</th>
                      <th className="text-left py-2 pr-4">Qty</th>
                      <th className="text-left py-2 pr-4">Rate</th>
                      <th className="text-left py-2 pr-4">City</th>
                      <th className="text-left py-2 pr-4">State</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2 pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr key={l.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{l.make}</td>
                        <td className="py-2 pr-4">{l.model}</td>
                        <td className="py-2 pr-4">{l.category}</td>
                        <td className="py-2 pr-4">{l.quantity}</td>
                        <td className="py-2 pr-4">
                          {l.daily_rate_usd != null ? `$${l.daily_rate_usd}` : "—"}
                        </td>
                        <td className="py-2 pr-4">{l.location_city ?? ""}</td>
                        <td className="py-2 pr-4">{l.location_state ?? ""}</td>

                        {/* Status cell */}
                        <td className="py-2 pr-4 text-xs">
                          <div>
                            {l.is_hidden ? (
                              <span className="text-neutral-500">Hidden</span>
                            ) : (
                              <span className="text-green-700">Visible</span>
                            )}
                          </div>
                          {l.is_boosted && (
                            <div className="text-[11px] text-amber-600">Boosted</div>
                          )}
                        </td>

                        {/* Actions cell */}
                        <td className="py-2 pr-0 text-xs">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              disabled={listBusyId === l.id}
                              onClick={() => toggleHidden(l)}
                              className="rounded-xl border px-2 py-0.5 disabled:opacity-50"
                            >
                              {l.is_hidden ? "Show" : "Hide"}
                            </button>
                            <button
                              disabled={listBusyId === l.id}
                              onClick={() => toggleBoost(l)}
                              className="rounded-xl border px-2 py-0.5 disabled:opacity-50"
                            >
                              {l.is_boosted ? "Unboost" : "Boost"}
                            </button>
                            <button
                              disabled={listBusyId === l.id}
                              onClick={() => removeListing(l)}
                              className="rounded-xl border px-2 py-0.5 text-red-700 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Bulk upload */}
          <BulkUploadSection
            providerId={provider.id}
            onAddMany={(rows) =>
              setListings((prev) => [...rows, ...prev])
            }
          />
        </>
      )}

      {!loading && !provider && (
        <section className="mt-8 rounded-2xl border p-4">
          <h2 className="text-lg font-semibold">No provider linked</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Your user account isn&apos;t linked to a provider yet. An admin will need to
            create a <code>provider_users</code> record for you in Supabase.
          </p>
          {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
        </section>
      )}
    </main>
  );
}

function BulkUploadSection({
  providerId,
  onAddMany,
}: {
  providerId: string;
  onAddMany: (rows: ProviderListingRow[]) => void;
}) {
  const [filename, setFilename] = useState<string>("");
  const [validRows, setValidRows] = useState<ListingNormalized[]>([]);
  const [issues, setIssues] = useState<RowIssue[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(f.name);
    setMsg(null);
    setValidRows([]);
    setIssues([]);
    setRawCount(0);

    const ext = f.name.toLowerCase().split(".").pop();
    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = () => {
        const wb = XLSX.read(reader.result as ArrayBuffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as UploadRowRaw[];
        processRows(json);
      };
      reader.readAsArrayBuffer(f);
    } else {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (res: { data: UploadRowRaw[]; }) => {
          processRows(res.data as UploadRowRaw[]);
        },
        error: (err: any) => {
          console.error(err);
          setMsg("Failed to parse CSV.");
        },
      });
    }
  }

  function processRows(rows: UploadRowRaw[]) {
    setRawCount(rows.length);
    const normalized = rows.map(normalizeRow);
    const { valid, issues } = validateRows(normalized);
    setValidRows(valid);
    setIssues(issues);
  }

  async function handleImport() {
    if (!validRows.length) return;
    setImporting(true);
    setMsg(null);

    try {
      const payload = validRows.map((r) => ({
        provider_id: providerId,
        make: r.make,
        model: r.model,
        category: r.category,
        quantity: r.quantity,
        daily_rate_usd: r.dailyRateUSD ?? null,
        location_city: r.locationCity || null,
        location_state: r.locationState || null,
        tags: r.tags ?? [],
      }));

      const { data, error } = await supabase
        .from("listings")
        .insert(payload)
        .select("*");

      if (error) {
        console.error(error);
        setMsg(`Import error: ${error.message}`);
      } else {
        const inserted = (data ?? []) as ProviderListingRow[];
        onAddMany(inserted);
        setMsg(`Imported ${inserted.length} listing(s).`);
        setValidRows([]);
        setRawCount(0);
      }
    } catch (e: any) {
      setMsg(`Import error: ${e?.message ?? "Unknown error"}`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">Bulk upload inventory</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Upload a CSV or Excel file with columns like{" "}
        <code>Make, Model, Category, Quantity, DailyRateUSD, City, State, Provider, Tags</code>.
        Category should be one of: Audio, Video, Lighting, Networking, Rigging.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFile}
          className="block text-sm"
        />
        {filename && (
          <span className="text-xs text-neutral-600">Loaded: {filename}</span>
        )}
      </div>

      {rawCount > 0 && (
        <div className="mt-4 text-sm text-neutral-600">
          Parsed {rawCount} row{rawCount === 1 ? "" : "s"} •{" "}
          {validRows.length} valid • {issues.length} with issues
        </div>
      )}

      {!!issues.length && (
        <div className="mt-3 max-h-40 overflow-auto rounded-xl border p-3 text-xs">
          {issues.map((i, idx) => (
            <div key={idx} className="text-red-700">
              Row {i.row}: {i.message}
            </div>
          ))}
        </div>
      )}

      {validRows.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-neutral-700">
            Ready to import <strong>{validRows.length}</strong> valid listing
            {validRows.length === 1 ? "" : "s"} into your account.
          </p>
          <button
            disabled={importing}
            onClick={handleImport}
            className="mt-2 rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
          >
            {importing ? "Importing…" : "Import listings"}
          </button>
        </div>
      )}

      {msg && <p className="mt-3 text-sm text-neutral-700">{msg}</p>}
    </section>
  );
}