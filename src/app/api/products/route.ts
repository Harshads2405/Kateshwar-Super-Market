
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        unit,
        image_url,
        in_stock,
        stock_quantity,
        category_id,
        product_categories (
          id,
          name,
          slug
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Products API error:", error.message);

      return NextResponse.json(
        { success: false, message: "Unable to load products." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      products: data,
    });
  } catch (error) {
    console.error("Unexpected products API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
