import { CartProvider } from "@/context/cart-context";

export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <CartProvider>{children}</CartProvider>;
}
