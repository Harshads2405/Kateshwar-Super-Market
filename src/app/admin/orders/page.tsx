
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  ShoppingBag,
  User,
  MapPin,
  Phone,
  Clock,
  Package,
} from "lucide-react";

type OrderStatus =
  | "New"
  | "Accepted"
  | "Packing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

type OrderItem = {
  id: string;
  product_name: string;
  unit: string;
  qty: number;
  price: number;
  subtotal: number;
};

type Order = {
  id: string;
  order_number: string;
  total: number;
  status: OrderStatus;
  delivery_time: string;
  delivery_address: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  customers: {
    id: string;
    name: string;
    phone: string;
  };
  order_items: OrderItem[];

  order_status_history: {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  reason: string | null;
  changed_at: string;
}[];

};

const statuses: OrderStatus[] = [
  "New",
  "Accepted",
  "Packing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function statusStyle(status: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    New: "bg-blue-100 text-blue-700",
    Accepted: "bg-indigo-100 text-indigo-700",
    Packing: "bg-yellow-100 text-yellow-700",
    "Out for Delivery": "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return styles[status];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load orders.");
      }

      setOrders(result.orders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update order.");
      }

      setMessage("Order status updated successfully.");
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Order Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View customer orders and manage their status.
            </p>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div role="status" className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {["All", ...statuses].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === status
                  ? "bg-green-700 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-slate-400" size={40} />
            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              No orders found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              There are no orders in this category.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <section
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {order.order_number}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">
                      {formatCurrency(Number(order.total))}
                    </p>

                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 py-5 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                      <User size={17} />
                      Customer Details
                    </h3>

                    <p className="font-medium text-slate-800">
                      {order.customers?.name ?? "Unknown customer"}
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={15} />
                      {order.customers?.phone ?? "Not available"}
                    </p>

                    <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={15} className="mt-0.5 shrink-0" />
                      {order.delivery_address}
                    </p>

                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={15} />
                      Delivery: {order.delivery_time}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Payment: {order.payment_method}
                    </p>

                    {order.notes && (
                      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                      <Package size={17} />
                      Ordered Products
                    </h3>

                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-3 border-b border-slate-100 pb-3 text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              {item.product_name}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {item.qty} × {item.unit} · {formatCurrency(Number(item.price))}
                            </p>
                          </div>

                          <p className="font-semibold text-slate-800">
                            {formatCurrency(Number(item.subtotal))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <label
                    htmlFor={`status-${order.id}`}
                    className="text-sm font-medium text-slate-700"
                  >
                    Update Order Status
                  </label>

                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(event) =>
                      void updateStatus(
                        order.id,
                        event.target.value as OrderStatus
                      )
                    }
                    className="min-w-48 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-green-600 disabled:opacity-50"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <h3 className="mb-4 font-semibold text-slate-800">
                      Order Status History
                    </h3>

                    {!order.order_status_history?.length ? (
                      <p className="text-sm text-slate-500">
                        No status history available.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {[...order.order_status_history]
                          .sort(
                            (a, b) =>
                              new Date(a.changed_at).getTime() -
                              new Date(b.changed_at).getTime()
                          )
                          .map((history) => (
                            <div
                              key={history.id}
                              className="flex gap-3"
                            >
                              <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-green-600" />

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {history.old_status
                                    ? `${history.old_status} → ${history.new_status}`
                                    : history.new_status}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {new Date(history.changed_at).toLocaleString("en-IN")}
                                </p>

                                {history.reason && (
                                  <p className="mt-1 text-xs text-slate-600">
                                    {history.reason}
                                  </p>
                                )}

                                {history.changed_by && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    Admin ID: {history.changed_by}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {updatingId === order.id && (
                  <p className="mt-3 text-right text-xs text-slate-500">
                    Updating order...
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
