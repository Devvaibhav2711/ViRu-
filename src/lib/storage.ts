import { CartLine } from "@/context/CartContext";

export type Order = {
  id: string;
  createdAt: number;
  customer: { name: string; phone: string; email: string; address: string };
  items: { id: string; name: string; price: number; qty: number }[];
  total: number;
  status: "pending" | "completed";
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

const ORDERS_KEY = "viru_orders_v1";
const REVIEWS_KEY = "viru_reviews_v1";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("viru-storage"));
}

export function getOrders(): Order[] {
  return read<Order>(ORDERS_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveOrder(input: {
  customer: Order["customer"];
  items: CartLine[];
  total: number;
}): Order {
  const order: Order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    createdAt: Date.now(),
    customer: input.customer,
    items: input.items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total: input.total,
    status: "pending",
  };
  write(ORDERS_KEY, [order, ...read<Order>(ORDERS_KEY)]);
  return order;
}

export function updateOrderStatus(id: string, status: Order["status"]) {
  const orders = read<Order>(ORDERS_KEY).map((o) => (o.id === id ? { ...o, status } : o));
  write(ORDERS_KEY, orders);
}

export function getReviews(): Review[] {
  return read<Review>(REVIEWS_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveReview(input: {
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
}): Review {
  const review: Review = {
    id: `REV-${Date.now().toString(36).toUpperCase()}`,
    orderId: input.orderId,
    customerName: input.customerName,
    rating: input.rating,
    comment: input.comment,
    createdAt: Date.now(),
    seenByAdmin: false,
  };
  write(REVIEWS_KEY, [review, ...read<Review>(REVIEWS_KEY)]);
  // Link to order
  const orders = read<Order>(ORDERS_KEY).map((o) =>
    o.id === input.orderId ? { ...o, reviewId: review.id } : o,
  );
  write(ORDERS_KEY, orders);
  return review;
}

export function markReviewSeen(id: string) {
  const reviews = read<Review>(REVIEWS_KEY).map((r) =>
    r.id === id ? { ...r, seenByAdmin: true } : r,
  );
  write(REVIEWS_KEY, reviews);
}

export function subscribeToStorage(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("viru-storage", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("viru-storage", handler);
    window.removeEventListener("storage", handler);
  };
}
