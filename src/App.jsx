import { useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import ItemCard from "./components/ItemCard";
import ListItemModal from "./components/ListItemModal";
import { mockItems } from "./data/mockItems";

export default function App() {
  const [items, setItems] = useState(mockItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(items.map((i) => i.category))],
    [items]
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewListing = (form) => {
    const newItem = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      category: form.category,
      price: form.price,
      contact: {
        name: form.contactName,
        phone: form.contactPhone,
        email: form.contactEmail,
      },
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
    };
    setItems((prev) => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen">
      <Header onListItem={() => setIsModalOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero / stats strip */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Borrow smarter. Share on campus.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-emerald-50 sm:text-base">
                Find calculators, cameras, lab gear, and more from students at
                Ruhuna — no shop needed.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "Listings", value: items.length },
                { label: "Categories", value: categories.length - 1 },
                { label: "Students", value: "500+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/15 px-3 py-3 text-center backdrop-blur sm:px-4"
                >
                  <p className="text-xl font-bold sm:text-2xl">{stat.value}</p>
                  <p className="text-xs text-emerald-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search & filters */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools, books, cameras..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filterCategory === cat
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Item grid */}
        {filteredItems.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-lg font-medium text-slate-600">No items found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try a different search or list your own item.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        EquiShare Ruhuna · Built for the university competition · {new Date().getFullYear()}
      </footer>

      <ListItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewListing}
      />
    </div>
  );
}