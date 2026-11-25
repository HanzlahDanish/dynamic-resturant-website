
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MenuItem {
  id: number;
  name: string;
  price: number | string;
  description: string;
}

interface FoodImage {
  image: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
}

export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [images, setImages] = useState<Record<number, FoodImage | null>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function searchFoodImage(id: number, name: string) {
    setImageLoading((previous) => ({ ...previous, [id]: true }));

    try {
      const response = await fetch(
        `/api/food-image?query=${encodeURIComponent(name)}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Image search failed");
      }

      const data = await response.json();

      if (data.image) {
        setImages((previous) => ({
          ...previous,
          [id]: {
            image: data.image,
            photographer: data.photographer,
            photographerUrl: data.photographerUrl,
            photoUrl: data.photoUrl,
          },
        }));
      } else {
        setImages((previous) => ({ ...previous, [id]: null }));
      }
    } catch (error) {
      console.error(`Image error for ${name}:`, error);
      setImages((previous) => ({ ...previous, [id]: null }));
    } finally {
      setImageLoading((previous) => ({ ...previous, [id]: false }));
    }
  }

  async function fetchMenu() {
    try {
      const response = await fetch("/api/menu", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load menu");
      }

      const data: MenuItem[] = await response.json();
      setItems(data);

      // Search for each food image separately.
      data.forEach((item) => {
        searchFoodImage(item.id, item.name);
      });
    } catch {
      setMessage("Unable to load menu. Check your database connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#171717]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-2xl font-black tracking-wide text-orange-400">
            THE FOOD HOUSE
          </Link>

          <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold">
            <Link href="/" className="text-gray-300 transition hover:text-orange-400">
              Home
            </Link>
            <a href="#menu" className="text-gray-300 transition hover:text-orange-400">
              Menu
            </a>
            <Link
              href="/admin"
              className="rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#3b160d] to-[#171717] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-semibold uppercase tracking-[0.3em] text-orange-400">
            Welcome to The Food House
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
            Delicious Food, Made With Passion.
          </h1>
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

      {/* Public Menu */}
      <section id="menu" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-widest text-orange-400">
            Our Collection
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Our Restaurant Menu
          </h2>
          <p className="mt-3 text-gray-400">
            Freshly listed dishes from our restaurant database.
          </p>
        </div>

        {message && (
          <p className="mb-6 rounded-lg bg-orange-500/10 p-4 text-orange-300">
            {message}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading menu...</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#1b1b1b] p-10 text-center text-gray-400">
            No menu items available yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b] transition hover:border-orange-500/50"
              >
                {/* Automatic Food Image */}
                <div className="relative h-56 w-full bg-[#292929]">
                  {images[item.id]?.image ? (
                    <img
                      src={images[item.id]?.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : imageLoading[item.id] ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      Finding food image...
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Image unavailable
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <span className="whitespace-nowrap font-bold text-orange-400">
                      Rs. {Number(item.price).toLocaleString("en-PK")}
                    </span>
                  </div>

                  <p className="mt-4 min-h-12 text-sm leading-6 text-gray-400">
                    {item.description}
                  </p>

                  
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Dashboard Link */}
      <section className="border-t border-white/10 bg-[#171717] px-6 py-12 text-center">
        <h2 className="text-2xl font-bold">Restaurant Management</h2>
        <p className="mt-3 text-gray-400">
          View the restaurant dashboard and menu management system.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block rounded-lg bg-orange-500 px-7 py-3 font-bold text-white transition hover:bg-orange-600"
        >
          Visit Admin Dashboard
        </Link>
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
