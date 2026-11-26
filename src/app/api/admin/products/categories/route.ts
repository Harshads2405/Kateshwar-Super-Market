
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("product_categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Admin categories API error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to load categories." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: data,
    });
  } catch (error) {
    console.error("Unexpected categories API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
