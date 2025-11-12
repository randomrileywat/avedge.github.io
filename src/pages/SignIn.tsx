import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignIn() {
  const [mode, setMode] = useState<"signin"|"signup"|"reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const redirectTo = `${location.origin}/auth/callback`; // used only for confirm/reset links

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Session is set immediately:
        location.assign("/dashboard");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: redirectTo }
        });
        if (error) throw error;

        // If “Confirm email” is OFF, user may be signed in already:
        if (data.session) {
          location.assign("/dashboard");
        } else {
          setMsg("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        setMsg("Password reset email sent.");
      }
    } catch (e:any) {
      setErr(e?.message ?? "Something went wrong");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">
        {mode==="signin" ? "Sign in" : mode==="signup" ? "Create account" : "Reset password"}
      </h1>

      <div className="mt-2 flex gap-3 text-sm">
        <button onClick={()=>setMode("signin")} className={`underline ${mode==="signin"?"font-semibold":""}`}>Sign in</button>
        <button onClick={()=>setMode("signup")} className={`underline ${mode==="signup"?"font-semibold":""}`}>Sign up</button>
        <button onClick={()=>setMode("reset")} className={`underline ${mode==="reset"?"font-semibold":""}`}>Reset</button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <input
          type="email" required placeholder="you@company.com" value={email}
          onChange={(e)=>setEmail(e.target.value)} className="rounded-xl border px-4 py-3"
        />
        {mode!=="reset" && (
          <input
            type="password" required placeholder="Password" value={password}
            onChange={(e)=>setPassword(e.target.value)} className="rounded-xl border px-4 py-3"
          />
        )}
        <button className="rounded-xl border px-4 py-3">
          {mode==="signin" ? "Sign in" : mode==="signup" ? "Create account" : "Send reset link"}
        </button>
      </form>

      {msg && <p className="mt-4 text-sm text-green-700">{msg}</p>}
      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
    </main>
  );
}
