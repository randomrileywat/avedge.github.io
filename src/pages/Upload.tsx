import { useMemo, useState } from "react";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeRow, validateRows, downloadText, downloadJSON, toCSV } from "../lib/inventory";
import type { UploadRowRaw, ListingNormalized } from "../types";

export default function Upload() {
  const [validRows, setValidRows] = useState<ListingNormalized[]>([]);
  const [issues, setIssues] = useState<{row:number; message:string}[]>([]);
  const [filename, setFilename] = useState<string>("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(f.name);

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
        transformHeader: (h: string) => h, // keep original then normalize later
        complete: (res: any) => {
          processRows(res.data);
        },
        error: (err: any) => {
          console.error(err);
          alert("Failed to parse CSV");
        }
      });
    }
  }

  function processRows(rows: UploadRowRaw[]) {
    const normalized = rows.map(normalizeRow);
    const { valid, issues } = validateRows(normalized);
    setValidRows(valid);
    setIssues(issues);
  }

  function downloadTemplate() {
    const template = `Make,Model,Category,Quantity,DailyRateUSD,City,State,Provider,Tags
L-Acoustics,LA12X,Audio,12,250,Tulsa,OK,Route 66 Productions,amp;controller
Barco,E2-Gen2,Video,2,750,Kansas City,MO,Midwest Staging,presentation;router
Novastar,VX4S,Video,6,120,Oklahoma City,OK,Sooner Media,led;processor
`;
    downloadText("av-edge-inventory-template.csv", template);
  }

  const preview = useMemo(() => validRows.slice(0, 10), [validRows]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Upload Inventory (CSV or Excel)</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Supported columns (case/spacing flexible): <code>Make, Model, Category, Quantity, DailyRateUSD, City, State, Provider, Tags</code>.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <input type="file" accept=".csv, .xlsx, .xls" onChange={onFile} className="block" />
        <button onClick={downloadTemplate} className="rounded-xl border px-4 py-2 text-sm">
          Download CSV template
        </button>
      </div>

      {filename && (
        <p className="mt-3 text-sm text-neutral-600">Loaded: <strong>{filename}</strong></p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Validation</h2>
        <p className="text-sm text-neutral-600 mt-1">
          {validRows.length} valid row{validRows.length===1?"":"s"} • {issues.length} issue{issues.length===1?"":"s"}
        </p>
        {!!issues.length && (
          <div className="mt-3 rounded-xl border p-3 max-h-52 overflow-auto text-sm">
            {issues.map((i, idx) => (
              <div key={idx} className="text-red-700">Row {i.row}: {i.message}</div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Preview (first 10)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Make","Model","Category","Qty","Rate","City","State","Provider","Tags"].map(h => (
                  <th key={h} className="text-left py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-4">{r.make}</td>
                  <td className="py-2 pr-4">{r.model}</td>
                  <td className="py-2 pr-4">{r.category}</td>
                  <td className="py-2 pr-4">{r.quantity}</td>
                  <td className="py-2 pr-4">{r.dailyRateUSD ?? ""}</td>
                  <td className="py-2 pr-4">{r.locationCity ?? ""}</td>
                  <td className="py-2 pr-4">{r.locationState ?? ""}</td>
                  <td className="py-2 pr-4">{r.providerName ?? ""}</td>
                  <td className="py-2 pr-4">{(r.tags ?? []).join(";")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          disabled={!validRows.length}
          onClick={() => downloadJSON("inventory-normalized.json", validRows)}
          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
        >
          Download JSON
        </button>
        <button
          disabled={!validRows.length}
          onClick={() => downloadText("inventory-normalized.csv", toCSV(validRows))}
          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
        >
          Download CSV
        </button>
      </div>
    </main>
  );
}