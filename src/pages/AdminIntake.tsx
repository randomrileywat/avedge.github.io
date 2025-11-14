import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import {
  getPendingIntake,
  approveIntake,
  updateIntakeStatus,
  type ProviderIntakeRow,
} from "../lib/db-intake";

const ADMIN_EMAILS = [
  "watson.riley.savanna@gmail.com",
];

export default function AdminIntake() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<ProviderIntakeRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email ?? "");

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoadingRows(true);
    setError(null);

    getPendingIntake()
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setLoadingRows(false);
      })
      .catch((e) => {
        console.error(e);
        if (cancelled) return;
        setError("Failed to load intake.");
        setLoadingRows(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (loading) {
    return <main className="px-6 py-12">Loading…</main>;
  }

  if (!isAdmin) {
    return (
      <main className="px-6 py-12">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-2 text-sm text-neutral-600">
          You’re not authorized to view this page.
        </p>
      </main>
    );
  }

  async function handleApprove(id: string) {
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      await approveIntake(id);
      setMessage("Intake approved and provider created.");
      // remove row from list
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to approve intake.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkReviewing(id: string) {
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      await updateIntakeStatus(id, "reviewing");
      setMessage("Intake marked as reviewing.");
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "reviewing" } : r))
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to update status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      await updateIntakeStatus(id, "rejected");
      setMessage("Intake marked as rejected.");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to reject intake.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Provider intake review</h1>
      <p className="mt-2 text-sm text-neutral-600">
        These submissions come from the “List your company” form.
      </p>

      {message && (
        <p className="mt-3 text-sm text-green-700">{message}</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      )}

      {loadingRows ? (
        <p className="mt-6 text-sm text-neutral-600">Loading intake rows…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          No new provider submissions right now.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((row) => (
            <IntakeCard
              key={row.id}
              row={row}
              busy={busyId === row.id}
              onApprove={() => handleApprove(row.id)}
              onReviewing={() => handleMarkReviewing(row.id)}
              onReject={() => handleReject(row.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function IntakeCard({
  row,
  busy,
  onApprove,
  onReviewing,
  onReject,
}: {
  row: ProviderIntakeRow;
  busy: boolean;
  onApprove: () => void;
  onReviewing: () => void;
  onReject: () => void;
}) {
  const cats = row.categories ?? [];

  return (
    <article className="rounded-2xl border px-4 py-3 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{row.company_name}</h2>
          <p className="mt-1 text-xs text-neutral-600">
            {row.city || "City unknown"}
            {row.state ? `, ${row.state}` : ""}
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Contact: {row.contact_name || "—"} ·{" "}
            <span className="underline">{row.contact_email}</span>
          </p>
          {row.phone && (
            <p className="mt-1 text-xs text-neutral-600">{row.phone}</p>
          )}
          {row.website && (
            <p className="mt-1 text-xs">
              <a
                href={row.website}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {row.website}
              </a>
            </p>
          )}

          {cats.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <span
                  key={c}
                  className="rounded-full border px-2 py-0.5 text-[11px] bg-neutral-50 text-neutral-700"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {row.notes && (
            <p className="mt-2 text-xs text-neutral-700">
              <span className="font-semibold">Notes:</span> {row.notes}
            </p>
          )}

          <p className="mt-2 text-[11px] text-neutral-500">
            Status: {row.status} · Submitted{" "}
            {new Date(row.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onApprove}
            disabled={busy}
            className="rounded-xl border px-3 py-1 text-xs disabled:opacity-50"
          >
            {busy ? "Working…" : "Approve & create provider"}
          </button>
          <button
            onClick={onReviewing}
            disabled={busy}
            className="rounded-xl border px-3 py-1 text-xs disabled:opacity-50"
          >
            Mark reviewing
          </button>
          <button
            onClick={onReject}
            disabled={busy}
            className="rounded-xl border px-3 py-1 text-xs text-red-700 border-red-300 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </article>
  );
}
