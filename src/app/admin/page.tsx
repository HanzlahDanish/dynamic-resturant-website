
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = {
  id: number;
  name: string;
  price: number | string;
  description: string;
};

type FoodImage = {
  image: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
};

async function searchFoodImage(name: string): Promise<FoodImage | null> {
  const response = await fetch(
    `/api/food-image?query=${encodeURIComponent(name)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Food image search failed.");
  }

  const data = await response.json();
  return data.image ? data : null;
}

export default function AdminPage() {
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [images, setImages] = useState<Record<number, FoodImage | null>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});

  const [isAdmin, setIsAdmin] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Search images for existing menu items
  useEffect(() => {
    async function initialize() {
      try {
        const [sessionResponse, menuResponse] = await Promise.all([
          fetch("/api/session", { cache: "no-store" }),
          fetch("/api/menu", { cache: "no-store" }),
        ]);

        if (!menuResponse.ok) {
          throw new Error("Unable to load menu items.");
        }

        const sessionData = await sessionResponse.json();
        const menuData: MenuItem[] = await menuResponse.json();

        setIsAdmin(
          sessionResponse.ok && sessionData.authenticated === true
        );

        setItems(menuData);
        setLoading(false);

        // Fetch images separately. Nothing is saved in NeonDB.
        for (const item of menuData) {
          setImageLoading((current) => ({
            ...current,
            [item.id]: true,
          }));
        }

        const results = await Promise.all(
          menuData.map(async (item) => {
            try {
              const image = await searchFoodImage(item.name);
              return { id: item.id, image };
            } catch {
              return { id: item.id, image: null };
            }
          })
        );

        const imageMap: Record<number, FoodImage | null> = {};

        results.forEach((result) => {
          imageMap[result.id] = result.image;
        });

        setImages(imageMap);
        setImageLoading({});
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
        setLoading(false);
      }
    }

    initialize();
  }, []);

  // Add menu item using only name, price and description
  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price,
          description,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setIsAdmin(false);
        throw new Error("Your admin session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to add menu item.");
      }

      setItems((current) => [data, ...current]);

      setName("");
      setPrice("");
      setDescription("");

      setMessage("Menu item added! Finding its food image...");

      // Search for the new item's image separately
      setImageLoading((current) => ({
        ...current,
        [data.id]: true,
      }));

      try {
        const image = await searchFoodImage(data.name);

        setImages((current) => ({
          ...current,
          [data.id]: image,
        }));
      } catch {
        setImages((current) => ({
          ...current,
          [data.id]: null,
        }));
      } finally {
        setImageLoading((current) => ({
          ...current,
          [data.id]: false,
        }));
      }

      setMessage("Menu item added successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add menu item."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete menu item
  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/menu", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setIsAdmin(false);
        throw new Error("Your admin session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete menu item.");
      }

      setItems((current) => current.filter((item) => item.id !== id));

      setImages((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });

      setMessage("Menu item deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete menu item."
      );
    }
  }

  // Logout admin
  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to log out.");
      }

      setIsAdmin(false);
      setMessage("You have logged out successfully.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Logout failed."
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101010] text-white">
        Loading restaurant dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#101010] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Dashboard Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              The Food House
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Restaurant Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Restaurant menu and management overview
            </p>
          </div>

          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="rounded-lg bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-600"
            >
              Owner Login
            </button>
          )}
        </header>

        {/* Alerts */}
        {error && (
          <p role="alert" className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mb-6 rounded-lg bg-green-500/10 p-4 text-green-400">
            {message}
          </p>
        )}

        {/* Dashboard Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#1b1b1b] p-6">
            <p className="text-sm text-gray-400">Total Menu Items</p>
            <p className="mt-2 text-3xl font-bold">{items.length}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#1b1b1b] p-6">
            <p className="text-sm text-gray-400">Dashboard Access</p>
            <p className="mt-2 text-xl font-bold">
              {isAdmin ? "Owner / Admin" : "Public Read-Only"}
            </p>
          </div>
        </section>

        {/* Add Menu Item - Admin Only */}
        {isAdmin && (
          <section className="mb-10 rounded-2xl border border-white/10 bg-[#1b1b1b] p-6">
            <h2 className="mb-2 text-2xl font-bold">
              Add New Menu Item
            </h2>

            <p className="mb-6 text-sm text-gray-400">
              Enter the dish details. Its food image will be found automatically.
            </p>

            <form onSubmit={handleAddItem} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Food Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Chicken Burger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (Rs.)
                </label>

                <input
                  type="number"
                  placeholder="e.g. 650"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  placeholder="Describe your delicious dish..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Adding Menu Item..." : "Add Menu Item"}
              </button>
            </form>
          </section>
        )}

        {/* Complete Menu */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Menu</h2>
              <p className="mt-1 text-sm text-gray-400">
                All restaurant dishes
              </p>
            </div>

            <span className="text-sm text-gray-400">
              {items.length} items
            </span>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-[#1b1b1b] p-6 text-gray-400">
              No menu items found.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const foodImage = images[item.id];

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b] transition hover:border-orange-500/50"
                  >
                  

{foodImage?.image ? (
  <img
    src={foodImage.image}
    alt={item.name}
    className="h-52 w-full object-cover"
  />
) : (
  <div className="flex h-52 items-center justify-center bg-[#252525] text-gray-500">
    {imageLoading[item.id]
      ? "Finding food image..."
      : "No matching image found"}
  </div>
)}


                    <div className="p-5">
                      <h3 className="text-xl font-bold">{item.name}</h3>

                      <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">
                        {item.description || "No description available."}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="font-bold text-orange-400">
                          Rs. {Number(item.price).toFixed(2)}
                        </p>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Back to Website */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 transition hover:text-orange-400"
          >
            ← View Public Restaurant Website
          </button>
        </div>
      </div>
    </main>
  );
}
