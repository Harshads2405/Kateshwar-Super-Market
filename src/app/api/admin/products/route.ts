
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Verify administrator authentication
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    // Use service-role client only after admin verification
    const supabase = createAdminClient();

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
        low_stock_threshold,
        track_inventory,
        is_active,
        category_id,
        product_categories (
          id,
          name,
          slug
        )
      `)
      .order("name", { ascending: true });

if (error) {
  console.error("Admin products API error:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Unable to load products.",
      debug: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    },
    { status: 500 }
  );
}

    return NextResponse.json({
      success: true,
      count: data.length,
      products: data,
    });
  } catch (error) {
    console.error("Unexpected admin products API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const categoryId = String(body.category_id ?? "");
    const price = Number(body.price);
    const unit = String(body.unit ?? "").trim();
    const imageUrl = String(body.image_url ?? "").trim();

    const trackInventory = body.track_inventory === true;
    const inStock = body.in_stock !== false;
    const isActive = body.is_active !== false;

    const stockQuantity = trackInventory
      ? Number(body.stock_quantity)
      : null;

    const lowStockThreshold = trackInventory
      ? Number(body.low_stock_threshold)
      : null;

    const minimumQuantity = Number(body.minimum_quantity ?? 1);
    const quantityStep = Number(body.quantity_step ?? 1);

    if (
      !name ||
      !categoryId ||
      !unit ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(minimumQuantity) ||
      minimumQuantity <= 0 ||
      !Number.isFinite(quantityStep) ||
      quantityStep <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter valid product details." },
        { status: 400 }
      );
    }

    if (
      trackInventory &&
      (
        !Number.isFinite(stockQuantity) ||
        stockQuantity! < 0 ||
        !Number.isFinite(lowStockThreshold) ||
        lowStockThreshold! < 0
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter valid stock quantities." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: category, error: categoryError } = await supabase
      .from("product_categories")
      .select("id")
      .eq("id", categoryId)
      .eq("is_active", true)
      .maybeSingle();

    if (categoryError || !category) {
      return NextResponse.json(
        { success: false, message: "Please select a valid category." },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        description: description || null,
        category_id: categoryId,
        price,
        unit,
        image_url: imageUrl || null,
        in_stock: trackInventory ? stockQuantity! > 0 : inStock,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold,
        track_inventory: trackInventory,
        minimum_quantity: minimumQuantity,
        quantity_step: quantityStep,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) {
      console.error("Create product error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to create product." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected create product error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}


export async function PATCH(request: Request) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const body = await request.json();

    const productId = String(body.id ?? "");
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const categoryId = String(body.category_id ?? "");
    const price = Number(body.price);
    const unit = String(body.unit ?? "").trim();
    const imageUrl = String(body.image_url ?? "").trim();

    const trackInventory = body.track_inventory === true;
    const isActive = body.is_active !== false;

    const stockQuantity = trackInventory
      ? Number(body.stock_quantity)
      : null;

    const lowStockThreshold = trackInventory
      ? Number(body.low_stock_threshold)
      : null;

    const minimumQuantity = Number(body.minimum_quantity ?? 1);
    const quantityStep = Number(body.quantity_step ?? 1);

    if (
      !productId ||
      !name ||
      !categoryId ||
      !unit ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(minimumQuantity) ||
      minimumQuantity <= 0 ||
      !Number.isFinite(quantityStep) ||
      quantityStep <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid product details." },
        { status: 400 }
      );
    }

    if (
      trackInventory &&
      (
        !Number.isFinite(stockQuantity) ||
        stockQuantity! < 0 ||
        !Number.isFinite(lowStockThreshold) ||
        lowStockThreshold! < 0
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid inventory quantities." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: category } = await supabase
      .from("product_categories")
      .select("id")
      .eq("id", categoryId)
      .eq("is_active", true)
      .maybeSingle();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Invalid product category." },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .update({
        name,
        description: description || null,
        category_id: categoryId,
        price,
        unit,
        image_url: imageUrl || null,
        track_inventory: trackInventory,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold,
        in_stock: trackInventory
          ? stockQuantity! > 0
          : body.in_stock !== false,
        minimum_quantity: minimumQuantity,
        quantity_step: quantityStep,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Update product error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to update product." },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Unexpected update product error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("products")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, name, is_active")
      .maybeSingle();

    if (error) {
      console.error("Product deactivation error:", error);
      return NextResponse.json(
        { success: false, message: "Unable to deactivate product." },
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
      message: "Product deactivated successfully.",
      product: data,
    });
  } catch (error) {
    console.error("DELETE product error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
