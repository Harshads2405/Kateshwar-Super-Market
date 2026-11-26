
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Package,
  Loader2,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  price: number;
  unit: string;
  image_url: string | null;
  track_inventory: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  minimum_quantity: number;
  quantity_step: number;
  in_stock: boolean;
  is_active: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  category_id: string;
  price: string;
  unit: string;
  image_url: string;
  track_inventory: boolean;
  stock_quantity: string;
  low_stock_threshold: string;
  minimum_quantity: string;
  quantity_step: string;
  in_stock: boolean;
  is_active: boolean;
};

const initialForm: ProductForm = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  unit: "",
  image_url: "",
  track_inventory: false,
  stock_quantity: "0",
  low_stock_threshold: "5",
  minimum_quantity: "1",
  quantity_step: "1",
  in_stock: true,
  is_active: true,
};

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [productId, setProductId] = useState<string | null>(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<ProductForm>(initialForm);

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Generate and clean up image preview URL
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedImage]);

  // Load categories and detect Add/Edit mode
  useEffect(() => {
    async function initializePage() {
      const id = new URLSearchParams(window.location.search).get("id");

      if (id) {
        setProductId(id);
        setLoadingProduct(true);
      }

      try {
        // Load categories
        const categoryResponse = await fetch(
          "/api/admin/products/categories",
          { cache: "no-store" }
        );

        const categoryResult = await categoryResponse.json();

        if (!categoryResponse.ok || !categoryResult.success) {
          throw new Error(
            categoryResult.message || "Unable to load categories."
          );
        }

        setCategories(categoryResult.categories ?? []);

        // If no ID, this is Add Product mode
        if (!id) return;

        // Load existing product details
        const productResponse = await fetch(
          "/api/admin/products",
          { cache: "no-store" }
        );

        const productResult = await productResponse.json();

        if (!productResponse.ok || !productResult.success) {
          throw new Error(
            productResult.message || "Unable to load products."
          );
        }

        const product = (productResult.products as Product[]).find(
          (item) => item.id === id
        );

        if (!product) {
          throw new Error("Product not found.");
        }

        setForm({
          name: product.name,
          description: product.description ?? "",
          category_id: product.category_id,
          price: String(product.price),
          unit: product.unit,
          image_url: product.image_url ?? "",
          track_inventory: product.track_inventory,
          stock_quantity: String(product.stock_quantity ?? 0),
          low_stock_threshold: String(
            product.low_stock_threshold ?? 5
          ),
          minimum_quantity: String(product.minimum_quantity ?? 1),
          quantity_step: String(product.quantity_step ?? 1),
          in_stock: product.in_stock,
          is_active: product.is_active,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to initialize product form."
        );
      } finally {
        setLoadingCategories(false);
        setLoadingProduct(false);
      }
    }

    void initializePage();
  }, []);

  // Update form fields
  function updateField(
    field: keyof ProductForm,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Handle image selection and validation
  function handleImageChange(file: File | null) {
    setError("");

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size === 0 || file.size > maxFileSize) {
      setError("Image size must be smaller than 5 MB.");
      return;
    }

    setSelectedImage(file);
  }

  // Validate and submit product
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.category_id ||
      !form.unit.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const price = Number(form.price);
    const minimumQuantity = Number(form.minimum_quantity);
    const quantityStep = Number(form.quantity_step);
    const stockQuantity = Number(form.stock_quantity);
    const lowStockThreshold = Number(form.low_stock_threshold);

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      !Number.isFinite(minimumQuantity) ||
      minimumQuantity <= 0 ||
      !Number.isFinite(quantityStep) ||
      quantityStep <= 0
    ) {
      setError(
        "Minimum quantity and quantity step must be greater than zero."
      );
      return;
    }

    if (
      form.track_inventory &&
      (
        !Number.isFinite(stockQuantity) ||
        stockQuantity < 0 ||
        !Number.isFinite(lowStockThreshold) ||
        lowStockThreshold < 0
      )
    ) {
      setError("Please enter valid inventory quantities.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = form.image_url;

      // Upload selected image to Supabase Storage
      if (selectedImage) {
        setUploadingImage(true);

        const imageFormData = new FormData();
        imageFormData.append("file", selectedImage);

        const uploadResponse = await fetch(
          "/api/admin/products/upload",
          {
            method: "POST",
            body: imageFormData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(
            uploadResult.message || "Unable to upload product image."
          );
        }

        imageUrl = uploadResult.image_url;
        setUploadingImage(false);
      }

      // Prepare product payload
      const payload = {
        ...(productId ? { id: productId } : {}),
        ...form,
        image_url: imageUrl,
        price,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold,
        minimum_quantity: minimumQuantity,
        quantity_step: quantityStep,
      };

      // Add or update product
      const response = await fetch("/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            (productId
              ? "Unable to update product."
              : "Unable to create product.")
        );
      }

      setSuccess(
        productId
          ? "Product updated successfully!"
          : "Product created successfully!"
      );

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  const pageLoading = loadingCategories || loadingProduct;

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {productId ? "Edit Product" : "Add New Product"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {productId
                ? "Update existing product information."
                : "Add a product to your supermarket catalogue."}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {pageLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-green-700"
            />

            <p className="mt-3 text-sm text-slate-500">
              {loadingProduct
                ? "Loading existing product details..."
                : "Loading categories..."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Package size={20} />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product Name *
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      updateField("name", e.target.value)
                    }
                    placeholder="e.g. Amul Butter"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Enter product description"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category *
                  </label>

                  <select
                    required
                    value={form.category_id}
                    onChange={(e) =>
                      updateField("category_id", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600"
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-800">
                Pricing and Unit
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Selling Price (₹) *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      updateField("price", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Unit *
                  </label>

                  <input
                    required
                    value={form.unit}
                    onChange={(e) =>
                      updateField("unit", e.target.value)
                    }
                    placeholder="e.g. 1 kg, 500 g, 1 litre"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </section>

            {/* Product Image */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                Product Image
              </h2>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Upload Product Image
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  handleImageChange(e.target.files?.[0] ?? null)
                }
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-green-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-800"
              />

              <p className="mt-2 text-xs text-slate-500">
                Supported formats: JPG, PNG, WebP. Maximum size: 5 MB.
              </p>

              {(imagePreview || form.image_url) && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Image Preview
                  </p>

                  <Image
                    src={imagePreview || form.image_url}
                    alt="Product preview"
                    width={144}
                    height={144}
                    unoptimized
                    className="h-36 w-36 rounded-xl border border-slate-200 object-cover"
                  />
                </div>
              )}

              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Or Enter Image URL
                </label>

                <input
                  type="url"
                  value={form.image_url}
                  disabled={saving}
                  onChange={(e) => {
                    updateField("image_url", e.target.value);
                    setSelectedImage(null);
                  }}
                  placeholder="https://example.com/product-image.jpg"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                />
              </div>
            </section>

            {/* Inventory */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-800">
                Inventory Management
              </h2>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.track_inventory}
                  onChange={(e) =>
                    updateField("track_inventory", e.target.checked)
                  }
                  className="h-4 w-4 accent-green-700"
                />

                <span className="text-sm font-medium text-slate-700">
                  Enable inventory tracking
                </span>
              </label>

              {form.track_inventory && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Stock Quantity *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      value={form.stock_quantity}
                      onChange={(e) =>
                        updateField("stock_quantity", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Low Stock Alert *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      value={form.low_stock_threshold}
                      onChange={(e) =>
                        updateField("low_stock_threshold", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Minimum Order Quantity
                  </label>

                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    required
                    value={form.minimum_quantity}
                    onChange={(e) =>
                      updateField("minimum_quantity", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Quantity Step
                  </label>

                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    required
                    value={form.quantity_step}
                    onChange={(e) =>
                      updateField("quantity_step", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </section>

            {/* Availability */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-800">
                Product Availability
              </h2>

              <div className="space-y-4">
                {!form.track_inventory && (
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.in_stock}
                      onChange={(e) =>
                        updateField("in_stock", e.target.checked)
                      }
                      className="h-4 w-4 accent-green-700"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      Product is in stock
                    </span>
                  </label>
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      updateField("is_active", e.target.checked)
                    }
                    className="h-4 w-4 accent-green-700"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Product is active and visible
                  </span>
                </label>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || pageLoading || categories.length === 0}
                className="flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    {uploadingImage
                      ? "Uploading image..."
                      : productId
                        ? "Updating..."
                        : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    {productId ? "Update Product" : "Save Product"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
