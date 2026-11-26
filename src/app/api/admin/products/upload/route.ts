
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const FILE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const { response } = await requireAdmin();

    if (response) return response;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select an image." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const extension = FILE_EXTENSIONS[file.type];
    const filePath = `products/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Product image upload error:", uploadError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to upload product image.",
        },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      message: "Product image uploaded successfully.",
      image_url: data.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Product image API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
