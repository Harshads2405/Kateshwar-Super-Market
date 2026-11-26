
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Plus,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  in_stock: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  track_inventory: boolean;
  is_active: boolean;
  product_categories: {
    name: string;
  } | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });

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
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.product_categories?.name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function stockLabel(product: Product) {
    if (!product.in_stock) return "Out of stock";

    if (
      product.track_inventory &&
      product.stock_quantity !== null &&
      product.low_stock_threshold !== null &&
      product.stock_quantity <= product.low_stock_threshold
    ) {
      return "Low stock";
    }

    return "In stock";
  }

  function stockStyle(product: Product) {
    const status = stockLabel(product);

    if (status === "Out of stock") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Low stock") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Product Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View and manage your supermarket products.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={() => {
                window.location.href = "/admin/products/add";
              }}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Products</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Active Products</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {products.filter((product) => product.is_active).length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Out of Stock</p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {products.filter((product) => !product.in_stock).length}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or categories..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-green-600"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package
                size={40}
                className="mx-auto text-slate-400"
              />
              <p className="mt-3 font-medium text-slate-700">
                No products found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 font-semibold">Visibility</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                              <Package
                                size={22}
                                className="text-slate-400"
                              />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-800">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {product.unit}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.product_categories?.name ?? "Uncategorized"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(Number(product.price))}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${stockStyle(product)}`}
                        >
                          {stockLabel(product)}
                        </span>

                        {product.track_inventory && (
                          <p className="mt-1 text-xs text-slate-500">
                            Quantity: {product.stock_quantity ?? 0}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.is_active
                              ? "text-green-700"
                              : "text-slate-500"
                          }
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Edit product"
                            onClick={() => {
                              window.location.href = `/admin/products/add?id=${product.id}`;
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete product"
                            disabled
                            className="cursor-not-allowed rounded-lg border border-slate-200 p-2 text-slate-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
