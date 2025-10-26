import { useState } from "react";
import { z } from "zod";

const Schema = z.object({
  company: z.string().min(2, "Company name is required"),
  contact: z.string().min(2, "Contact name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, "Use 2-letter state").optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  notes: z.string().optional()
});

const CATEGORIES = ["Audio","Video","Lighting","Networking","Rigging"];

export default function ProviderIntake() {
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [errs, setErrs] = useState<Record<string,string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = {
      company: String(fd.get("company")||""),
      contact: String(fd.get("contact")||""),
      email: String(fd.get("email")||""),
      phone: String(fd.get("phone")||""),
      city: String(fd.get("city")||""),
      state: String(fd.get("state")||""),
      website: String(fd.get("website")||""),
      categories: fd.getAll("categories").map(String),
      notes: String(fd.get("notes")||""),
      // honeypot
      hello: String(fd.get("hello")||"")
    };

    // honeypot spam trap
    if (form.hello) return;

    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      const map: Record<string,string> = {};
      parsed.error.issues.forEach(i => { map[i.path[0] as string] = i.message; });
      setErrs(map);
      return;
    }
    setErrs({});
    setStatus("sending");

    // replace with your Formspree endpoint
    const endpoint = "https://formspree.io/f/your-id-here";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new FormData(e.currentTarget)
    });

    setStatus(res.ok ? "ok" : "err");
    if (res.ok) (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">List Your Company</h1>
      <p className="mt-2 text-neutral-600">
        Fill this out and we’ll contact you to sync inventory and verify your listing.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <div className="hidden">
          <label>Do not fill this out<input name="hello" className="border" /></label>
        </div>

        <Field label="Company" name="company" required error={errs.company} />
        <Field label="Contact name" name="contact" required error={errs.contact} />
        <Field label="Email" name="email" type="email" required error={errs.email} />
        <Field label="Phone" name="phone" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City" name="city" />
          <Field label="State (2-letter)" name="state" maxLength={2} />
        </div>
        <Field label="Website" name="website" placeholder="https://…" />

        <fieldset className="rounded-xl border p-4">
          <legend className="px-2 text-sm font-medium">Categories</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {CATEGORIES.map(c => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="categories" value={c} className="h-4 w-4" />
                {c}
              </label>
            ))}
          </div>
          {errs.categories && <p className="mt-2 text-sm text-red-600">{errs.categories}</p>}
        </fieldset>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea name="notes" rows={4} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>

        <div className="flex items-center gap-3">
          <button disabled={status==="sending"} className="rounded-xl border px-5 py-3">
            {status==="sending" ? "Submitting…" : "Submit"}
          </button>
          {status==="ok" && <span className="text-sm text-green-700">Thanks — we’ll be in touch!</span>}
          {status==="err" && <span className="text-sm text-red-700">Something went wrong. Try again.</span>}
        </div>
      </form>
    </main>
  );
}

function Field(props: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; maxLength?: number; error?: string;
}) {
  const { label, name, type="text", required=false, placeholder, maxLength, error } = props;
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}{required && <span className="text-red-600"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1 w-full rounded-xl border px-3 py-2"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
