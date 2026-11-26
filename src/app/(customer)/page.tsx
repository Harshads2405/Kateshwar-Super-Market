import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Kateshwar
          </p>
          <h1 className="text-2xl font-bold">Super Market</h1>
        </div>
        <Link className="rounded-full border px-4 py-2 text-sm" href="/admin/login">
          Admin
        </Link>
      </header>
      <section className="my-auto py-20">
        <p className="mb-3 font-semibold text-emerald-700">Your neighbourhood grocery store</p>
        <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
          Fresh essentials, made easy to order.
        </h2>
        <p className="mt-5 max-w-xl text-slate-600">
          Browse everyday groceries and place a local delivery order. Product catalogue and checkout
          will be connected during implementation.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white">
            Browse products
          </Link>
          <Link href="/cart" className="rounded-xl border border-slate-300 px-6 py-3 font-semibold">
            View cart
          </Link>
        </div>
      </section>
      <footer className="border-t py-5 text-sm text-slate-500">
        Local grocery ordering · Cash on Delivery
      </footer>
    </main>
  );
}
