// Replace/extend with generated Supabase database types after the schema is finalized.
export type OrderStatus =
  | "New"
  | "Accepted"
  | "Packing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type DeliveryTime = "Now" | "Evening";
export type PaymentMethod = "COD";
