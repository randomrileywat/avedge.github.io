import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  if (loading) return <main className="px-6 py-12">Loading…</main>;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Provider Dashboard</h1>
      <p className="mt-2 text-neutral-600">Signed in as <strong>{user.email}</strong></p>

      <div className="mt-6 grid gap-3">
        <a href="/upload" className="rounded-xl border px-4 py-3 inline-block">Upload inventory</a>
        {/* Future: Manage listings, profile, API keys */}
      </div>

      <button onClick={signOut} className="mt-8 rounded-xl border px-4 py-2">Sign out</button>
    </main>
  );
}
