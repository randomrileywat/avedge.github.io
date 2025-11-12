import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const [msg, setMsg] = useState("Finishing sign in…");
  const ran = useRef(false);
  const nav = useNavigate();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const url = new URL(window.location.href);
      const type = url.searchParams.get("type"); // 'signup'/'recovery' etc.
      const code = url.searchParams.get("code");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(url.toString());
          if (error) throw error;
          // Clean URL
          window.history.replaceState({}, "", `${location.origin}/auth/callback`);
        }
        if (type === "recovery") {
          nav("/set-new-password", { replace: true });
        } else {
          nav("/dashboard", { replace: true });
        }
      } catch (e:any) {
        setMsg(`Error: ${e?.message ?? "Unknown error"}`);
      }
    })();
  }, [nav]);

  return <main className="mx-auto max-w-md px-6 py-12"><p>{msg}</p></main>;
}
