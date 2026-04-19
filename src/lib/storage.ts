import { supabase } from "./supabase";
import { CartLine } from "@/context/CartContext";
import { menuItems } from "@/data/menu";

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

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  originalPrice?: number;
  badge?: string;
  active: boolean;
  updatedAt: number;
};

export type Founder = {
  id: string;
  name: string;
  degree: string;
  info: string;
  photoUrl: string;
  active: boolean;
  updatedAt: number;
};

const PRODUCTS_LOCAL_KEY = "viru_products_v1";
const FOUNDERS_LOCAL_KEY = "viru_founders_v1";
const MAX_ORDER_BYTES = 10 * 1024;

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

  const compactCustomer = {
    name: compactText(input.customer.name, 60),
    phone: compactText(input.customer.phone, 20),
    email: compactText(input.customer.email, 100),
    address: compactText(input.customer.address, 180),
  };

  const compactItems = input.items.slice(0, 25).map((i) => ({
    id: compactText(i.id, 30),
    name: compactText(i.name, 60),
    price: Number(i.price) || 0,
    qty: Number(i.qty) || 1,
  }));

  const row = {
    id,
    customer_name: compactCustomer.name,
    customer_phone: compactCustomer.phone,
    customer_email: compactCustomer.email,
    customer_address: compactCustomer.address,
    items: compactItems,
    total: input.total,
    status: "pending",
    phone_verified: input.phoneVerified ?? false,
  };

  if (estimateBytes(row) > MAX_ORDER_BYTES) {
    row.customer_address = compactText(compactCustomer.address, 90);
  }

  const { data, error } = await supabase.from("orders").insert(row).select().single();

  if (error) {
    console.error("Failed to save order:", error.message);
    // Return a local fallback so the UI doesn't break
    return {
      id,
      createdAt: Date.now(),
      customer: compactCustomer,
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
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => cb())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Products (CRUD) ─────────────────────────────────────

export async function getProducts(includeInactive = false): Promise<Product[]> {
  const query = supabase.from("products").select("*").order("updated_at", { ascending: false });
  const { data, error } = includeInactive ? await query : await query.eq("active", true);

  if (!error && data) {
    const rows = (data ?? []).map(mapProduct);
    if (rows.length > 0) {
      writeProductsLocal(rows);
      return rows;
    }
  }

  const local = readProductsLocal();
  if (local.length > 0) {
    return includeInactive ? local : local.filter((p) => p.active);
  }

  const seeded = seedProducts();
  return includeInactive ? seeded : seeded.filter((p) => p.active);
}

export async function createProduct(input: Omit<Product, "updatedAt" | "active">): Promise<Product> {
  const row = {
    id: compactText(input.id || `item-${Date.now().toString(36)}`, 40),
    name: compactText(input.name, 70),
    price: Number(input.price) || 0,
    description: compactText(input.description, 160),
    image: compactText(input.image, 500),
    original_price: input.originalPrice ?? null,
    badge: input.badge ? compactText(input.badge, 50) : null,
    active: true,
  };

  const { data, error } = await supabase.from("products").insert(row).select().single();
  if (!error && data) {
    const created = mapProduct(data);
    mergeProductLocal(created);
    return created;
  }

  const fallback: Product = {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description,
    image: row.image,
    originalPrice: row.original_price ?? undefined,
    badge: row.badge ?? undefined,
    active: true,
    updatedAt: Date.now(),
  };
  mergeProductLocal(fallback);
  return fallback;
}

export async function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "name" | "price" | "description" | "image" | "originalPrice" | "badge" | "active">>,
): Promise<void> {
  const row = {
    ...(patch.name !== undefined ? { name: compactText(patch.name, 70) } : {}),
    ...(patch.price !== undefined ? { price: Number(patch.price) || 0 } : {}),
    ...(patch.description !== undefined ? { description: compactText(patch.description, 160) } : {}),
    ...(patch.image !== undefined ? { image: compactText(patch.image, 500) } : {}),
    ...(patch.originalPrice !== undefined ? { original_price: patch.originalPrice } : {}),
    ...(patch.badge !== undefined ? { badge: patch.badge ? compactText(patch.badge, 50) : null } : {}),
    ...(patch.active !== undefined ? { active: patch.active } : {}),
  };

  const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
  if (!error && data) {
    mergeProductLocal(mapProduct(data));
    return;
  }

  const local = readProductsLocal();
  const updated = local.map((p) =>
    p.id === id
      ? {
          ...p,
          ...patch,
          updatedAt: Date.now(),
        }
      : p,
  );
  writeProductsLocal(updated);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    const local = readProductsLocal().filter((p) => p.id !== id);
    writeProductsLocal(local);
    return;
  }

  const local = readProductsLocal().filter((p) => p.id !== id);
  writeProductsLocal(local);
}

// ─── Founders (local admin-managed profile cards) ─────────

export async function getFounders(includeInactive = false): Promise<Founder[]> {
  const local = readFoundersLocal();
  if (local.length > 0) {
    return includeInactive ? local : local.filter((founder) => founder.active);
  }

  const seeded = seedFounders();
  return includeInactive ? seeded : seeded.filter((founder) => founder.active);
}

export async function createFounder(input: Omit<Founder, "updatedAt" | "active">): Promise<Founder> {
  const founder: Founder = {
    id: compactText(input.id || `founder-${Date.now().toString(36)}`, 40),
    name: compactText(input.name, 70),
    degree: compactText(input.degree, 80),
    info: compactText(input.info, 220),
    photoUrl: compactText(input.photoUrl, 500),
    active: true,
    updatedAt: Date.now(),
  };

  const local = readFoundersLocal();
  local.unshift(founder);
  writeFoundersLocal(local);
  return founder;
}

export async function updateFounder(
  id: string,
  patch: Partial<Pick<Founder, "name" | "degree" | "info" | "photoUrl" | "active">>,
): Promise<void> {
  const local = readFoundersLocal();
  const updated = local.map((founder) =>
    founder.id === id
      ? {
          ...founder,
          ...(patch.name !== undefined ? { name: compactText(patch.name, 70) } : {}),
          ...(patch.degree !== undefined ? { degree: compactText(patch.degree, 80) } : {}),
          ...(patch.info !== undefined ? { info: compactText(patch.info, 220) } : {}),
          ...(patch.photoUrl !== undefined ? { photoUrl: compactText(patch.photoUrl, 500) } : {}),
          ...(patch.active !== undefined ? { active: patch.active } : {}),
          updatedAt: Date.now(),
        }
      : founder,
  );
  writeFoundersLocal(updated);
}

export async function deleteFounder(id: string): Promise<void> {
  const local = readFoundersLocal().filter((founder) => founder.id !== id);
  writeFoundersLocal(local);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description ?? "",
    image: row.image ?? "",
    originalPrice: row.original_price ?? undefined,
    badge: row.badge ?? undefined,
    active: row.active ?? true,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

function compactText(value: string, maxLen: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function estimateBytes(value: unknown): number {
  return new Blob([JSON.stringify(value)]).size;
}

function seedProducts(): Product[] {
  const seeded = menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    description: item.description,
    image: item.image,
    originalPrice: item.originalPrice,
    badge: item.badge,
    active: true,
    updatedAt: Date.now(),
  }));
  writeProductsLocal(seeded);
  return seeded;
}

function readProductsLocal(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRODUCTS_LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProductsLocal(list: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRODUCTS_LOCAL_KEY, JSON.stringify(list));
}

function mergeProductLocal(product: Product) {
  const local = readProductsLocal();
  const idx = local.findIndex((p) => p.id === product.id);
  if (idx === -1) local.unshift(product);
  else local[idx] = product;
  writeProductsLocal(local);
}

function seedFounders(): Founder[] {
  const seeded: Founder[] = [
    {
      id: "vaibhav",
      name: "Vaibhav",
      degree: "BCA completed",
      info: "Tech, product, and customer experience",
      photoUrl: "",
      active: true,
      updatedAt: Date.now(),
    },
    {
      id: "rohit",
      name: "Rohit",
      degree: "B.Tech completed",
      info: "Operations, execution, and growth",
      photoUrl: "",
      active: true,
      updatedAt: Date.now(),
    },
  ];
  writeFoundersLocal(seeded);
  return seeded;
}

function readFoundersLocal(): Founder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FOUNDERS_LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Founder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFoundersLocal(list: Founder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FOUNDERS_LOCAL_KEY, JSON.stringify(list));
}
