import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  IndianRupee,
  MessageSquare,
  Star,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Bell,
} from "lucide-react";
import {
  getOrders,
  getReviews,
  subscribeToStorage,
  updateOrderStatus,
  markReviewSeen,
  type Order,
  type Review,
} from "@/lib/storage";

const ADMIN_PIN = "1234";
const PIN_KEY = "viru_admin_unlocked";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ViRu Wadapav" },
      { name: "description", content: "Admin dashboard for ViRu Wadapav orders and reviews." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(PIN_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(PIN_KEY, "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("Wrong PIN. Try again.");
      setPin("");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-hero animate-gradient flex items-center justify-center px-4">
        <form
          onSubmit={tryUnlock}
          className="w-full max-w-sm rounded-3xl bg-background p-8 shadow-card stitch-border animate-bounce-in"
        >
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-3 text-center text-2xl font-extrabold">Admin Access</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Enter your PIN to view the dashboard
          </p>
          <input
            type="password"
            inputMode="numeric"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
            className="mt-5 w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-lg font-bold tracking-widest outline-none focus:border-primary"
          />
          {error && <p className="mt-2 text-center text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="ripple mt-4 w-full rounded-full bg-primary py-3 font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] active:scale-95"
          >
            Unlock 🔓
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Demo PIN: <span className="font-mono font-bold">1234</span>
          </p>
          <Link
            to="/"
            className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" /> Back to shop
          </Link>
        </form>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<"orders" | "reviews">("orders");

  useEffect(() => {
    const refresh = () => {
      setOrders(getOrders());
      setReviews(getReviews());
    };
    refresh();
    return subscribeToStorage(refresh);
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const pendingFeedback = reviews.filter((r) => !r.seenByAdmin).length;
  const avgRating =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const logout = () => {
    sessionStorage.removeItem(PIN_KEY);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <div>
              <h1 className="text-lg font-extrabold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">ViRu Wadapav</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Shop
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Total Orders"
            value={orders.length.toString()}
            tint="primary"
          />
          <StatCard
            icon={<IndianRupee className="h-5 w-5" />}
            label="Revenue"
            value={`₹${totalRevenue}`}
            tint="accent"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Pending Orders"
            value={pendingOrders.toString()}
            tint="primary"
          />
          <StatCard
            icon={<Bell className="h-5 w-5" />}
            label="New Feedback"
            value={pendingFeedback.toString()}
            tint="accent"
            pulse={pendingFeedback > 0}
          />
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-soft stitch-border">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-accent text-accent" />
            <span className="font-bold text-lg">{avgRating}</span>
            <span className="text-sm text-muted-foreground">
              avg rating · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
            Orders ({orders.length})
          </TabButton>
          <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")}>
            Reviews ({reviews.length})
            {pendingFeedback > 0 && (
              <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                {pendingFeedback}
              </span>
            )}
          </TabButton>
        </div>

        {tab === "orders" ? (
          <OrdersList orders={orders} onToggle={(id, s) => updateOrderStatus(id, s)} />
        ) : (
          <ReviewsList reviews={reviews} onSeen={(id) => markReviewSeen(id)} />
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: "primary" | "accent";
  pulse?: boolean;
}) {
  return (
    <div className={`rounded-2xl bg-card p-4 shadow-soft stitch-border lift-card ${pulse ? "animate-pop" : ""}`}>
      <div
        className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full ${
          tint === "primary" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
        }`}
      >
        {icon}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-offer rounded-full" />
      )}
    </button>
  );
}

function OrdersList({
  orders,
  onToggle,
}: {
  orders: Order[];
  onToggle: (id: string, status: Order["status"]) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground stitch-border">
        <span className="text-5xl">📦</span>
        <p className="mt-2">No orders yet</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {orders.map((o, i) => (
        <li
          key={o.id}
          style={{ animationDelay: `${i * 50}ms` }}
          className="rounded-2xl bg-card p-4 shadow-soft stitch-border animate-slide-up"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-1 font-bold">{o.customer.name}</p>
              <p className="text-xs text-muted-foreground">
                {o.customer.phone} · {o.customer.email}
              </p>
              <p className="text-xs text-muted-foreground">{o.customer.address}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-primary">₹{o.total}</p>
              <button
                onClick={() => onToggle(o.id, o.status === "pending" ? "completed" : "pending")}
                className="mt-2 rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted"
              >
                Mark {o.status === "pending" ? "Completed" : "Pending"}
              </button>
            </div>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            {o.items.map((it) => (
              <li
                key={it.id}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
              >
                {it.name} × {it.qty}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
        <CheckCircle2 className="h-3 w-3" /> Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

function ReviewsList({
  reviews,
  onSeen,
}: {
  reviews: Review[];
  onSeen: (id: string) => void;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground stitch-border">
        <MessageSquare className="mx-auto h-10 w-10" />
        <p className="mt-2">No reviews yet</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {reviews.map((r, i) => (
        <li
          key={r.id}
          style={{ animationDelay: `${i * 50}ms` }}
          className={`rounded-2xl bg-card p-4 shadow-soft stitch-border animate-slide-up ${
            !r.seenByAdmin ? "ring-2 ring-accent/50" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{r.customerName}</p>
              <p className="text-[11px] text-muted-foreground">
                Order {r.orderId} · {new Date(r.createdAt).toLocaleString()}
              </p>
              <div className="mt-1 flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${
                      n <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
            </div>
            {!r.seenByAdmin && (
              <button
                onClick={() => onSeen(r.id)}
                className="shrink-0 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground hover:bg-accent/30"
              >
                Mark seen
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
