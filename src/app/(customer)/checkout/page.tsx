
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils/currency";

export default function CheckoutPage() {
  const router = useRouter();

  const { items, subtotal, isLoaded, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("Now");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          deliveryTime,
          notes,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to place your order.");
      }

      setSuccess({
        orderNumber: result.order.order_number,
        total: Number(result.order.total),
      });

      clearCart();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <main className="p-10 text-center">Loading checkout...</main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">🎉</div>

          <h1 className="mt-5 text-2xl font-bold text-emerald-800">
            Order placed successfully!
          </h1>

          <p className="mt-3 text-slate-600">
            Thank you for shopping with Kateshwar Super Market.
          </p>

          <div className="mt-6 rounded-xl bg-emerald-50 p-5">
            <p className="text-sm text-slate-600">Your Order Number</p>
            <p className="mt-1 text-xl font-bold text-emerald-800">
              {success.orderNumber}
            </p>

            <div className="mt-4 border-t border-emerald-200 pt-4">
              <p className="text-sm text-slate-600">Order Total</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(success.total)}
              </p>
            </div>

            <p className="mt-3 text-sm font-medium text-emerald-800">
              Payment: Cash on Delivery
            </p>
          </div>

          <Link
            href="/products"
            className="mt-7 block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="rounded-2xl border bg-white p-10 text-center">
          <div className="text-5xl">🛒</div>
          <h1 className="mt-4 text-xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-slate-500">
            Add some products before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-800">
            Kateshwar Super Market
          </Link>

          <Link
            href="/cart"
            className="text-sm font-semibold text-emerald-700"
          >
            Back to Cart
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-2 text-slate-600">
          Enter your details to place your grocery order.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
        >
          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Customer Details
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full Name *
                  </label>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Mobile Number *
                  </label>
                  <input
                    required
                    type="tel"
                    minLength={8}
                    maxLength={20}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Delivery Address
              </h2>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Complete Address *
                </label>
                <textarea
                  required
                  minLength={8}
                  maxLength={500}
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, street, area, landmark..."
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  maxLength={500}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special delivery instructions?"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Delivery Time
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Now", "Evening"].map((time) => (
                  <label
                    key={time}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                      deliveryTime === time
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryTime"
                      value={time}
                      checked={deliveryTime === time}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="accent-emerald-700"
                    />
                    <span className="font-medium">
                      {time === "Now" ? "As soon as possible" : "Evening"}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {item.product.name}
                    </p>
                    <p className="text-slate-500">
                      {item.quantity} ×{" "}
                      {formatCurrency(Number(item.product.price))}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(
                      Number(item.product.price) * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 border-t" />

            <div className="flex justify-between font-bold">
              <span>Estimated Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Final prices and stock are verified when your order is placed.
              Delivery charges, if any, will be confirmed by the shop.
            </p>

            <div className="mt-5 rounded-xl bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-800">
                Cash on Delivery
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Pay when your groceries arrive.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              By placing your order, you confirm your delivery details.
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}
