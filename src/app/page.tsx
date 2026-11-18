
"use client";

import { useEffect, useState } from "react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch menu items from NeonDB
  async function fetchMenu() {
    try {
      setLoading(true);
      const response = await fetch("/api/menu");
      if (!response.ok) throw new Error("Failed to load menu");

      const data = await response.json();
      setItems(data);
    } catch {
      setMessage("Unable to load menu. Check your database connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  // Add new menu item
  async function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to add item");
      }

      setName("");
      setPrice("");
      setDescription("");
      setMessage("Menu item added successfully!");
      await fetchMenu();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // Delete menu item
  async function deleteItem(id: number) {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch("/api/menu", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Unable to delete item");

      setMessage("Menu item deleted successfully!");
      await fetchMenu();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#171717]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-black tracking-wide text-orange-400">
            THE FOOD HOUSE
          </h1>
          <span className="text-sm text-gray-400">
            Fresh Food. Great Taste.
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#3b160d] to-[#171717] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-semibold uppercase tracking-[0.3em] text-orange-400">
            Welcome to The Food House
          </p>
          <h2 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
            Delicious Food, Made With Passion.
          </h2>
          <p className="mt-5 max-w-xl text-gray-300">
            Explore our menu and enjoy delicious meals prepared with fresh
            ingredients.
          </p>
          <a
            href="#menu"
            className="mt-8 inline-block rounded-lg bg-orange-500 px-7 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Explore Menu
          </a>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-widest text-orange-400">
            Our Collection
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Our Restaurant Menu
          </h2>
          <p className="mt-3 text-gray-400">
            All menu items are loaded directly from NeonDB.
          </p>
        </div>

        {message && (
          <p className="mb-6 rounded-lg bg-orange-500/10 p-4 text-orange-300">
            {message}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading menu...
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#1b1b1b] p-10 text-center text-gray-400">
            No menu items available. Add your first dish below!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-6 transition hover:border-orange-500/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <span className="whitespace-nowrap font-bold text-orange-400">
                    Rs. {Number(item.price).toLocaleString("en-PK")}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-gray-400">
                  {item.description}
                </p>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="mt-6 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  Delete Item
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Add Menu Item Form */}
      <section className="border-t border-white/10 bg-[#171717] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">
            Add a New Menu Item
          </h2>
          <p className="mt-3 text-gray-400">
            Add your restaurant dishes to the NeonDB database.
          </p>

          <form onSubmit={addItem} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Item Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken Burger"
                className="w-full rounded-lg border border-white/10 bg-[#252525] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (Rs.)
              </label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 650"
                className="w-full rounded-lg border border-white/10 bg-[#252525] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your delicious dish..."
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-[#252525] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Menu Item"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 The Food House. Dynamic Restaurant Website.
        <br />
        Powered by Next.js and NeonDB.
      </footer>
    </main>
  );
}
