
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;
    const body = await request.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Valid product status is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("products")
      .update({
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, name, is_active")
      .maybeSingle();

    if (error) {
      console.error("Product status update error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to update product status." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.is_active
        ? "Product activated successfully."
        : "Product deactivated successfully.",
      product: data,
    });
  } catch (error) {
    console.error("Product status API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
