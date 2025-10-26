import SearchBar from "../components/SearchBar";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AV Edge</h1>
        <a href="#notify" className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
          List your inventory
        </a>
      </header>

      <section className="mt-12">
        <h2 className="text-4xl font-bold tracking-tight">
          Find pro AV rental gear—fast.
        </h2>
        <p className="mt-3 text-lg text-neutral-600">
          Search regional inventories across the U.S. and send one request for quotes.
        </p>

        <div className="mt-6">
          <SearchBar />
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {["Audio", "Video", "Lighting"].map((tag) => (
          <div key={tag} className="rounded-xl border p-5">
            <h3 className="font-semibold">{tag}</h3>
            <p className="text-sm text-neutral-600">
              Browse regional {tag.toLowerCase()} rentals.
            </p>
          </div>
        ))}
      </section>

      <section id="notify" className="mt-16 rounded-2xl border p-6">
        <h3 className="text-lg font-semibold">Get notified at launch</h3>
        <p className="mt-1 text-sm text-neutral-600">
          We will email you when AV Edge opens to providers and searchers.
        </p>
        <form
          action="https://formspree.io/f/your-id-here"
          method="POST"
          className="mt-4 flex gap-3"
        >
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="w-full rounded-xl border px-4 py-3"
          />
          <button className="rounded-xl border px-5 py-3">Notify me</button>
        </form>
      </section>
    </main>
  );
}
