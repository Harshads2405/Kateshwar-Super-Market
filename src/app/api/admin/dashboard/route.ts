
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Verify admin authentication.
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const supabase = await createClient();

    // Fetch order and product data.
    const [ordersResult, productsResult] = await Promise.all([
      supabase
        .from("orders")
        .select("total, status"),

      supabase
        .from("products")
        .select(
          "id, track_inventory, stock_quantity, low_stock_threshold, in_stock"
        ),
    ]);

    if (ordersResult.error) {
      throw ordersResult.error;
    }

    if (productsResult.error) {
      throw productsResult.error;
    }

    const orders = ordersResult.data ?? [];
    const products = productsResult.data ?? [];

    const totalOrders = orders.length;

    const newOrders = orders.filter(
      (order) => order.status === "New"
    ).length;

    // Exclude cancelled orders from revenue.
    const totalRevenue = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + Number(order.total), 0);

    const totalProducts = products.length;

    const lowStockProducts = products.filter(
      (product) =>
        product.track_inventory &&
        product.stock_quantity !== null &&
        product.low_stock_threshold !== null &&
        product.stock_quantity <= product.low_stock_threshold
    ).length;

    const outOfStockProducts = products.filter(
      (product) => !product.in_stock
    ).length;

    return NextResponse.json({
      success: true,
      dashboard: {
        totalOrders,
        newOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard data.",
      },
      { status: 500 }
    );
  }
}
