
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  IndianRupee,
  Package,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";

type DashboardData = {
  totalOrders: number;
  newOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
};

const cards = [
  {
    key: "totalOrders",
    title: "Total Orders",
    icon: ShoppingBag,
    color: "bg-blue-100 text-blue-700",
  },
  {
    key: "newOrders",
    title: "New Orders",
    icon: Clock,
    color: "bg-orange-100 text-orange-700",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    icon: IndianRupee,
    color: "bg-green-100 text-green-700",
  },
  {
    key: "totalProducts",
    title: "Total Products",
    icon: Package,
    color: "bg-purple-100 text-purple-700",
  },
  {
    key: "lowStockProducts",
    title: "Low Stock Products",
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    key: "outOfStockProducts",
    title: "Out of Stock",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
] as const;

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load dashboard.");
      }

      setDashboard(result.dashboard);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  function formatValue(key: keyof DashboardData, value: number) {
    if (key === "totalRevenue") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(value);
    }

    return value.toLocaleString("en-IN");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome to Kateshwar Super Market management.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !dashboard ? (
          <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading dashboard...
          </div>
        ) : dashboard ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              const value = dashboard[card.key];

              return (
                <div
                  key={card.key}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <div className={`rounded-lg p-3 ${card.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <p className="mt-5 text-3xl font-bold text-slate-900">
                    {formatValue(card.key, value)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800"
            >
              Manage Orders
            </Link>

            <Link
              href="/admin/products"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage Products
            </Link>

            <Link
              href="/admin/customers"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View Customers
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
