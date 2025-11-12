import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Providers from "./pages/Providers";
import ProviderIntake from "./pages/ProviderIntake";
import Upload from "./pages/Upload";
import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import SetNewPassword from "./pages/SetNewPassword";
import { useAuth } from "./lib/auth";

function Nav() {
  const { user, signOut } = useAuth();
  return (
    <nav className="border-b">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center gap-6">
        <Link to="/" className="font-semibold">AV Edge</Link>
        <Link to="/search" className="text-sm">Search</Link>
        <Link to="/providers" className="text-sm">Providers</Link>
        <Link to="/list" className="text-sm">List company</Link>
        <Link to="/upload" className="text-sm">Upload</Link>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm">Dashboard</Link>
              <button onClick={signOut} className="rounded-xl border px-3 py-1.5 text-sm">Sign out</button>
            </>
          ) : (
            <Link to="/signin" className="rounded-xl border px-3 py-1.5 text-sm">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/list" element={<ProviderIntake />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <footer className="mt-12 border-t">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-neutral-500">
          © {new Date().getFullYear()} AV Edge
        </div>
      </footer>
    </>
  );
}
