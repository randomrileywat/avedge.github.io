import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { Category } from "../types";

const CATEGORY_OPTIONS: Category[] = [
  "Audio",
  "Video",
  "Lighting",
  "Networking",
  "Rigging",
];

export default function ProviderIntake() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleCategory(c: Category) {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const { error } = await supabase.from("provider_intake").insert([
        {
          user_id: user?.id ?? null,
          company_name: companyName,
          contact_name: contactName || null,
          contact_email: contactEmail,
          phone: phone || null,
          website: website || null,
          city: city || null,
          state: state || null,
          categories,
          notes: notes || null,
          status: "new",
        },
      ]);

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setMessage(
          "Thanks for reaching out! We’ve received your info and will follow up as we onboard providers."
        );
        // light reset
        setCompanyName("");
        setContactName("");
        setContactEmail("");
        setPhone("");
        setWebsite("");
        setCity("");
        setState("");
        setCategories([]);
        setNotes("");
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong submitting your info.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">List your company on AV Edge</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Share a few details about your rental company and we’ll follow up as we
        onboard early providers into the platform.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="block text-sm font-medium">Company name *</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Contact name</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contact email *</label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">State (2-letter)</label>
            <input
              value={state}
              maxLength={2}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Primary categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((c) => {
              const active = categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={
                    "rounded-full border px-3 py-1 text-xs " +
                    (active
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-700 border-neutral-300")
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Anything else we should know?
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <button
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>

        {message && (
          <p className="text-sm text-green-700 mt-2">{message}</p>
        )}
        {error && (
          <p className="text-sm text-red-700 mt-2">{error}</p>
        )}

        {user && (
          <p className="mt-4 text-xs text-neutral-500">
            Logged in as <strong>{user.email}</strong>. We’ll tie this intake to
            your account.
          </p>
        )}
      </form>
    </main>
  );
}
