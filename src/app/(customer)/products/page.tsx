
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  in_stock: boolean;
  stock_quantity: number | null;
  category_id: string | null;
  product_categories: Category | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { addToCart, itemCount } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load products.");
        }

        setProducts(result.products ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, Category>();

    products.forEach((product) => {
      if (product.product_categories) {
        map.set(
          product.product_categories.id,
          product.product_categories
        );
      }
    });

    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category_id === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-800">
            Kateshwar Super Market
          </Link>
          <Link
            href="/cart"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
          >
            View Cart ({itemCount})
          </Link>
                  </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Fresh groceries, everyday essentials
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Our Products
          </h1>
          <p className="mt-2 text-slate-600">
            Browse our grocery collection and find what you need.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="search"
            placeholder="Search groceries..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 sm:max-w-md"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              selectedCategory === "all"
                ? "bg-emerald-700 text-white"
                : "bg-white text-slate-700 border"
            }`}
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === category.id
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-slate-700 border"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading && (
          <p className="py-16 text-center text-slate-500">
            Loading products...
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-xl border border-dashed bg-white px-5 py-16 text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              No products found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {products.length === 0
                ? "Products will appear here once the store adds them."
                : "Try another search or category."}
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex h-44 items-center justify-center bg-slate-100">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">🛒</span>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium text-emerald-700">
                    {product.product_categories?.name ?? "Grocery"}
                  </p>

                  <h2 className="mt-1 font-semibold text-slate-900">
                    {product.name}
                  </h2>

                  {product.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {product.description}
                    </p>
                  )}
               
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        ₹{Number(product.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        per {product.unit}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.in_stock
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        unit: product.unit,
                        image_url: product.image_url,
                        in_stock: product.in_stock,
                      })
                    }
                    disabled={!product.in_stock}
                    className="mt-4 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {product.in_stock ? "Add to Cart" : "Out of Stock"}
                  </button>
                  </div>
                  </article>

            ))}
          </div>
        )}
      </section>
    </main>
  );
}
