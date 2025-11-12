import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SetNewPassword() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string|null>(null);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setErr(error.message);
    else nav("/dashboard", { replace: true });
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">Set a new password</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <input type="password" required placeholder="New password" value={pw}
               onChange={(e)=>setPw(e.target.value)} className="rounded-xl border px-4 py-3" />
        <button className="rounded-xl border px-4 py-3">Save</button>
        {err && <p className="text-sm text-red-700 mt-2">{err}</p>}
      </form>
    </main>
  );
}
