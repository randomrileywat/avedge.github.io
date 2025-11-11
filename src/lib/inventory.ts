import { z } from "zod";
import type { ListingNormalized, UploadRowRaw, Category } from "../types";

// Accept common header variants
const HEADER_MAP: Record<string, keyof ListingNormalized> = {
  "make": "make",
  "manufacturer": "make",
  "brand": "make",

  "model": "model",
  "sku": "model",

  "category": "category",
  "type": "category",

  "qty": "quantity",
  "quantity": "quantity",
  "count": "quantity",

  "rate": "dailyRateUSD",
  "dailyrate": "dailyRateUSD",
  "daily_rate": "dailyRateUSD",
  "price_per_day": "dailyRateUSD",

  "city": "locationCity",
  "locationcity": "locationCity",

  "state": "locationState",
  "locationstate": "locationState",

  "provider": "providerName",
  "company": "providerName",
  "vendor": "providerName",

  "tags": "tags"
};

const CategoryEnum = z.enum(["Audio","Video","Lighting","Networking","Rigging"]);
const RowSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  category: CategoryEnum,
  quantity: z.coerce.number().int().nonnegative(),
  dailyRateUSD: z.coerce.number().positive().optional().nullable(),
  locationCity: z.string().optional(),
  locationState: z.string().max(2).optional(),
  providerName: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export type RowIssue = { row: number; message: string };

export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+|[_-]+/g, "");
}

export function normalizeRow(raw: UploadRowRaw): Partial<ListingNormalized> {
  const out: Partial<ListingNormalized> = {};
  for (const [k, v] of Object.entries(raw)) {
    const canon = HEADER_MAP[normalizeHeader(k)];
    if (!canon) continue;
    if (canon === "tags") {
      out.tags = String(v ?? "")
        .split(/[;,]/).map(s => s.trim()).filter(Boolean);
    } else if (canon === "category") {
      const val = String(v ?? "").trim();
      out.category = (val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()) as Category;
    } else if (canon === "quantity") {
      out.quantity = Number(v ?? 0);
    } else if (canon === "dailyRateUSD") {
      const num = String(v ?? "").replace(/[$,\s]/g, "");
      out.dailyRateUSD = num ? Number(num) : null;
    } else {
      // make, model, city, state, provider
      (out as any)[canon] = typeof v === "string" ? v.trim() : v;
    }
  }
  return out;
}

export function validateRows(rows: Partial<ListingNormalized>[]) {
  const valid: ListingNormalized[] = [];
  const issues: RowIssue[] = [];

  rows.forEach((r, idx) => {
    const res = RowSchema.safeParse(r);
    if (res.success) valid.push(res.data);
    else {
      const msg = res.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      issues.push({ row: idx + 2, message: msg }); // +2 accounts for header row (1) and 1-based UX
    }
  });

  return { valid, issues };
}

export function toCSV(rows: ListingNormalized[]): string {
  const header = ["make","model","category","quantity","dailyRateUSD","locationCity","locationState","providerName","tags"];
  const lines = [header.join(",")];
  rows.forEach(r => {
    const vals = [
      r.make, r.model, r.category, r.quantity,
      r.dailyRateUSD ?? "", r.locationCity ?? "", r.locationState ?? "",
      r.providerName ?? "", (r.tags ?? []).join(";")
    ].map(v => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    });
    lines.push(vals.join(","));
  });
  return lines.join("\n");
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadJSON(filename: string, obj: unknown) {
  downloadText(filename, JSON.stringify(obj, null, 2));
}