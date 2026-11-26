import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdmin();

    if (response) return response;

    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;

    const search = (searchParams.get("search") ?? "")
      .trim()
      .replace(/[,%()\\]/g, "")
      .slice(0, 100);

    const requestedPage = Number(searchParams.get("page") ?? "1");
    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let customersQuery = supabase
      .from("customers")
      .select(
        "id, name, phone, address, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      customersQuery = customersQuery.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data: customers, error, count } = await customersQuery;

    if (error) {
      console.error("Admin customers query failed:", error.message);

      return NextResponse.json(
        { success: false, message: "Unable to retrieve customers." },
        { status: 500 }
      );
    }

    const customerIds = (customers ?? []).map((customer) => customer.id);

    let orders: {
      customer_id: string;
      total: number;
      status: string;
      created_at: string;
    }[] = [];

    if (customerIds.length > 0) {
      const { data: orderData, error: ordersError } = await supabase
        .from("orders")
        .select("customer_id, total, status, created_at")
        .in("customer_id", customerIds)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error(
          "Admin customer orders query failed:",
          ordersError.message
        );

        return NextResponse.json(
          { success: false, message: "Unable to retrieve customer orders." },
          { status: 500 }
        );
      }

      orders = orderData ?? [];
    }

    const orderStats = new Map<
      string,
      {
        orderCount: number;
        totalSpent: number;
        lastOrderAt: string | null;
      }
    >();

    for (const order of orders) {
      const existing = orderStats.get(order.customer_id) ?? {
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
      };

      existing.orderCount += 1;

      if (order.status !== "Cancelled") {
        existing.totalSpent += Number(order.total);
      }

      if (!existing.lastOrderAt) {
        existing.lastOrderAt = order.created_at;
      }

      orderStats.set(order.customer_id, existing);
    }

    const result = (customers ?? []).map((customer) => ({
      ...customer,
      orderCount: orderStats.get(customer.id)?.orderCount ?? 0,
      totalSpent: orderStats.get(customer.id)?.totalSpent ?? 0,
      lastOrderAt: orderStats.get(customer.id)?.lastOrderAt ?? null,
    }));

    const totalCustomers = count ?? 0;

    return NextResponse.json({
      success: true,
      customers: result,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        totalCustomers,
        totalPages: Math.ceil(totalCustomers / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("Admin customers API error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
