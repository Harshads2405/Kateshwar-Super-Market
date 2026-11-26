
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderSchema } from "@/lib/validations/order.schema";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your checkout details.",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc(
      "create_customer_order",
      {
        p_customer_name: input.customerName,
        p_phone: input.phone,
        p_address: input.address,
        p_delivery_time: input.deliveryTime,
        p_notes: input.notes ?? "",
        p_items: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        p_idempotency_key: randomUUID(),
      }
    );

    if (error) {
      console.error("Order creation failed:", error.message);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your order has been placed successfully.",
      order: data,
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to place your order. Please try again.",
      },
      { status: 500 }
    );
  }
}
