
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_STATUSES = [
  "New",
  "Accepted",
  "Packing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

// GET: Retrieve orders with customer and product details.
export async function GET() {
  try {
    const { response } = await requireAdmin();

    if (response) return response;

    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total,
        status,
        delivery_time,
        delivery_address,
        payment_method,
        notes,
        created_at,
        customers (
          id,
          name,
          phone
        ),
        order_items (
          id,
          product_name,
          unit,
          qty,
          price,
          subtotal
        ),
        order_status_history (
          id,
          old_status,
          new_status,
          changed_by,
          reason,
          changed_at
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Admin orders query failed:", error.message);

      return NextResponse.json(
        { success: false, message: "Unable to retrieve orders." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: orders?.length ?? 0,
      orders: orders ?? [],
    });
  } catch (error) {
    console.error("Admin orders API error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// PATCH: Update order status and record status history.
export async function PATCH(request: NextRequest) {
  try {
    const { user, response } = await requireAdmin();

    if (response) return response;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("orderId" in body) ||
      !("status" in body)
    ) {
      return NextResponse.json(
        { success: false, message: "Order ID and status are required." },
        { status: 400 }
      );
    }

    const { orderId, status } = body as {
      orderId: unknown;
      status: unknown;
    };

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (typeof orderId !== "string" || !uuidPattern.test(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    if (
      typeof status !== "string" ||
      !ORDER_STATUSES.includes(status as OrderStatus)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order status." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc(
      "admin_update_order_status",
      {
        p_order_id: orderId,
        p_new_status: status,
        p_changed_by: user.id,
      }
    );

    if (error) {
      console.error("Order status update failed:", error.message);

      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      result: data,
    });
  } catch (error) {
    console.error("Order status API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update order status." },
      { status: 500 }
    );
  }
}
