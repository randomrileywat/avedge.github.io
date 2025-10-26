import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Providers from "./pages/Providers";
import ProviderIntake from "./pages/ProviderIntake";

export default function App() {
  return (
    <>
      <nav className="border-b">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center gap-6">
          <Link to="/" className="font-semibold">AV Edge</Link>
          <Link to="/search" className="text-sm text-neutral-700">Search</Link>
          <Link to="/providers" className="text-sm text-neutral-700">Providers</Link>
          <Link to="/list" className="ml-auto rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
            List your company
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/list" element={<ProviderIntake />} />
      </Routes>

      <footer className="mt-12 border-t">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-neutral-500">
          © {new Date().getFullYear()} AV Edge
        </div>
      </footer>
    </>
  );
}
