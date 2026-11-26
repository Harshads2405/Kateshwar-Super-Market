
"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils/currency";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    isLoaded,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-center">
        Loading your cart...
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

          <Link href="/products" className="text-sm font-semibold text-emerald-700">
            Continue Shopping
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Your Shopping Cart
        </h1>

        <p className="mt-2 text-slate-600">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed bg-white px-5 py-16 text-center">
            <div className="text-5xl">🛒</div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-slate-500">
              Explore our products and add your daily essentials.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.product.id}
                  className="flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {item.product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🛒</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900">
                      {item.product.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Per {item.product.unit}
                    </p>
                    <p className="mt-2 font-bold text-slate-900">
                      {formatCurrency(Number(item.product.price))}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-3 rounded-lg border px-2 py-1">
                      <button
                        aria-label={`Decrease ${item.product.name} quantity`}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        className="px-2 py-1 text-lg font-semibold"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        aria-label={`Increase ${item.product.name} quantity`}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        className="px-2 py-1 text-lg font-semibold"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold text-emerald-800">
                      {formatCurrency(
                        Number(item.product.price) * item.quantity
                      )}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}

              <button
                onClick={clearCart}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Clear entire cart
              </button>
            </div>

            <aside className="h-fit rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Order Summary
              </h2>

              <div className="mt-6 flex justify-between text-sm text-slate-600">
                <span>Items ({itemCount})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="mt-4 flex justify-between text-sm text-slate-600">
                <span>Delivery charges</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="my-5 border-t" />

              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-xl bg-emerald-700 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-800"
              >
                Proceed to Checkout
              </Link>

              <p className="mt-4 text-center text-xs text-slate-500">
                Payment method: Cash on Delivery
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
