import { supabase } from "./supabase";
import { CartLine } from "@/context/CartContext";

export type Order = {
  id: string;
  createdAt: number;
  customer: { name: string; phone: string; email: string; address: string };
  items: { id: string; name: string; price: number; qty: number }[];
  total: number;
  status: "pending" | "completed";
  phoneVerified: boolean;
  reviewId?: string;
};

export type Review = {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: number;
  seenByAdmin: boolean;
};

// ─── Orders ───────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error.message);
    return [];
  }

  return (data ?? []).map(mapOrder);
}

export async function saveOrder(input: {
  customer: Order["customer"];
  items: CartLine[];
  total: number;
  phoneVerified?: boolean;
}): Promise<Order> {
  const id = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const row = {
    id,
    customer_name: input.customer.name,
    customer_phone: input.customer.phone,
    customer_email: input.customer.email,
    customer_address: input.customer.address,
    items: input.items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total: input.total,
    status: "pending",
    phone_verified: input.phoneVerified ?? false,
  };

  const { data, error } = await supabase.from("orders").insert(row).select().single();

  if (error) {
    console.error("Failed to save order:", error.message);
    // Return a local fallback so the UI doesn't break
    return {
      id,
      createdAt: Date.now(),
      customer: input.customer,
      items: row.items,
      total: input.total,
      status: "pending",
      phoneVerified: row.phone_verified,
    };
  }

  return mapOrder(data);
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) console.error("Failed to update order status:", error.message);
}

// ─── Reviews ──────────────────────────────────────────────

export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews:", error.message);
    return [];
  }

  return (data ?? []).map(mapReview);
}

export async function saveReview(input: {
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const id = `REV-${Date.now().toString(36).toUpperCase()}`;

  const row = {
    id,
    order_id: input.orderId,
    customer_name: input.customerName,
    rating: input.rating,
    comment: input.comment,
    seen_by_admin: false,
  };

  const { data, error } = await supabase.from("reviews").insert(row).select().single();

  if (error) {
    console.error("Failed to save review:", error.message);
    return {
      id,
      orderId: input.orderId,
      customerName: input.customerName,
      rating: input.rating,
      comment: input.comment,
      createdAt: Date.now(),
      seenByAdmin: false,
    };
  }

  // Link review to order
  await supabase.from("orders").update({ review_id: id }).eq("id", input.orderId);

  return mapReview(data);
}

export async function markReviewSeen(id: string) {
  const { error } = await supabase.from("reviews").update({ seen_by_admin: true }).eq("id", id);
  if (error) console.error("Failed to mark review seen:", error.message);
}

// ─── Realtime subscription helper ─────────────────────────

export function subscribeToChanges(cb: () => void) {
  const channel = supabase
    .channel("admin-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => cb())
    .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => cb())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Mappers (DB row → app type) ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(row: any): Order {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      address: row.customer_address,
    },
    items: row.items ?? [],
    total: Number(row.total),
    status: row.status,
    phoneVerified: row.phone_verified ?? false,
    reviewId: row.review_id ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(row: any): Review {
  return {
    id: row.id,
    orderId: row.order_id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: new Date(row.created_at).getTime(),
    seenByAdmin: row.seen_by_admin ?? false,
  };
}
