
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Search,
  ShoppingBag,
  IndianRupee,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Phone,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalCustomers: number;
  totalPages: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string | null) => {
  if (!date) return "No orders yet";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    totalCustomers: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(pagination.page),
          search: search.trim(),
        });

        const response = await fetch(
          `/api/admin/customers?${params.toString()}`,
          { signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load customers.");
        }

        setCustomers(result.customers ?? []);
        setPagination(result.pagination);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading customers."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [pagination.page, search]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadCustomers(controller.signal);

    return () => controller.abort();
  }, [loadCustomers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const customersWithOrders = customers.filter(
    (customer) => customer.orderCount > 0
  ).length;

  const totalOrdersOnPage = customers.reduce(
    (total, customer) => total + customer.orderCount,
    0
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your registered customers and their order activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadCustomers()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Customers
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {pagination.totalCustomers}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Users size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Customers With Orders
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {customersWithOrders}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                On this page
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <ShoppingBag size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Orders
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {totalOrdersOnPage}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                From customers on this page
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <IndianRupee size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by customer name or mobile..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={() => loadCustomers()}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Customer List
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {pagination.totalCustomers} customer(s) found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Contact</th>
                <th className="px-5 py-4 font-semibold">Address</th>
                <th className="px-5 py-4 font-semibold">Orders</th>
                <th className="px-5 py-4 font-semibold">Total Spent</th>
                <th className="px-5 py-4 font-semibold">Last Order</th>
                <th className="px-5 py-4 font-semibold">Registered</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <RefreshCw size={18} className="animate-spin" />
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Users
                      size={35}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="font-medium text-slate-700">
                      No customers found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try another search term.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {customer.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            ID: {customer.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone size={14} className="text-slate-400" />
                        {customer.phone}
                      </div>
                    </td>

                    <td className="max-w-[220px] px-5 py-4">
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />
                        <span className="line-clamp-2">
                          {customer.address}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {customer.orderCount}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(customer.lastOrderAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarDays
                          size={14}
                          className="text-slate-400"
                        />
                        {formatDate(customer.created_at)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages}
              {" "}({pagination.totalCustomers} customers)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
