import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  ShieldCheck,
  RefreshCw,
  Users,
  Pencil,
  Trash2,
  Plus,
  Package,
  ImagePlus,
  Camera,
} from "lucide-react";
import {
  getOrders,
  getReviews,
  subscribeToChanges,
  updateOrderStatus,
  markReviewSeen,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getFounders,
  createFounder,
  updateFounder,
  deleteFounder,
  type Order,
  type Review,
  type Product,
  type Founder,
} from "@/lib/storage";

const ADMIN_PIN = "ViRuwadapav2711";
const PIN_KEY = "viru_admin_unlocked";

type AdminTab = "orders" | "reviews" | "products" | "customers" | "founders";

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
            Unlock
          </button>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [tab, setTab] = useState<AdminTab>("orders");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [o, r, p, f] = await Promise.all([getOrders(), getReviews(), getProducts(true), getFounders(true)]);
    setOrders(o);
    setReviews(r);
    setProducts(p);
    setFounders(f);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const unsub = subscribeToChanges(() => {
      fetchData();
    });
    return unsub;
  }, [fetchData]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const pendingFeedback = reviews.filter((r) => !r.seenByAdmin).length;
  const activeProducts = products.filter((p) => p.active).length;
  const activeFounders = founders.filter((f) => f.active).length;
  const customers = useMemo(() => groupCustomers(orders), [orders]);

  const avgRating =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "-";

  const handleToggle = async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status);
    fetchData();
  };

  const handleSeen = async (id: string) => {
    await markReviewSeen(id);
    fetchData();
  };

  const logout = () => {
    sessionStorage.removeItem(PIN_KEY);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,hsl(var(--accent)/0.14),transparent_30%),radial-gradient(circle_at_85%_10%,hsl(var(--primary)/0.16),transparent_32%),hsl(var(--background))]">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <div>
              <h1 className="text-lg font-extrabold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">ViRu Wadapav Control Room</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
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
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Total Orders" value={orders.length.toString()} tint="primary" />
              <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={`₹${totalRevenue}`} tint="accent" />
              <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Orders" value={pendingOrders.toString()} tint="primary" />
              <StatCard icon={<Package className="h-5 w-5" />} label="Products" value={activeProducts.toString()} tint="accent" />
              <StatCard icon={<Users className="h-5 w-5" />} label="Customers" value={customers.length.toString()} tint="primary" />
              <StatCard icon={<Camera className="h-5 w-5" />} label="Founders" value={activeFounders.toString()} tint="accent" />
            </div>

            <div className="rounded-2xl bg-card p-4 shadow-soft stitch-border">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="font-bold text-lg">{avgRating}</span>
                <span className="text-sm text-muted-foreground">
                  avg rating · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
                {pendingFeedback > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                    {pendingFeedback} new feedback
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border">
              <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>Orders ({orders.length})</TabButton>
              <TabButton active={tab === "customers"} onClick={() => setTab("customers")}>Customers ({customers.length})</TabButton>
              <TabButton active={tab === "products"} onClick={() => setTab("products")}>Products ({activeProducts})</TabButton>
              <TabButton active={tab === "founders"} onClick={() => setTab("founders")}>Founders ({activeFounders})</TabButton>
              <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")}>Reviews ({reviews.length})</TabButton>
            </div>

            {tab === "orders" && <OrdersList orders={orders} onToggle={handleToggle} />}
            {tab === "customers" && <CustomersList customers={customers} />}
            {tab === "products" && <ProductsManager products={products} onChanged={fetchData} />}
            {tab === "founders" && <FoundersManager founders={founders} onChanged={fetchData} />}
            {tab === "reviews" && <ReviewsList reviews={reviews} onSeen={handleSeen} />}
          </>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: "primary" | "accent";
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft stitch-border">
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
      {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-offer rounded-full" />}
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
                {o.phoneVerified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="mt-1 font-bold">{o.customer.name}</p>
              <p className="text-xs text-muted-foreground">
                {o.customer.phone} · {o.customer.email}
              </p>
              <p className="text-xs text-muted-foreground">{o.customer.address || "Shop pickup"}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
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
              <li key={it.id} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
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

type CustomerSummary = {
  key: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  orders: number;
  spent: number;
  lastOrderAt: number;
  storageBytes: number;
};

function groupCustomers(orders: Order[]): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();

  orders.forEach((o) => {
    const key = `${o.customer.phone}|${o.customer.email}`;
    const current = map.get(key);
    const compact = {
      name: o.customer.name,
      phone: o.customer.phone,
      email: o.customer.email,
      address: o.customer.address,
    };

    if (!current) {
      map.set(key, {
        key,
        ...compact,
        orders: 1,
        spent: o.total,
        lastOrderAt: o.createdAt,
        storageBytes: new Blob([JSON.stringify(compact)]).size,
      });
      return;
    }

    current.orders += 1;
    current.spent += o.total;
    current.lastOrderAt = Math.max(current.lastOrderAt, o.createdAt);
    if (!current.address && compact.address) current.address = compact.address;
  });

  return [...map.values()].sort((a, b) => b.lastOrderAt - a.lastOrderAt);
}

function CustomersList({ customers }: { customers: CustomerSummary[] }) {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground stitch-border">
        <Users className="mx-auto h-10 w-10" />
        <p className="mt-2">No customer records yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-card shadow-soft stitch-border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-border bg-muted/40 text-left">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Orders</th>
            <th className="px-4 py-3">Spent</th>
            <th className="px-4 py-3">Last Order</th>
            <th className="px-4 py-3">Data Size</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.key} className="border-b border-border/70 last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.address || "Shop pickup"}</p>
              </td>
              <td className="px-4 py-3 text-xs">
                <p>{c.phone}</p>
                <p className="text-muted-foreground">{c.email}</p>
              </td>
              <td className="px-4 py-3 font-semibold">{c.orders}</td>
              <td className="px-4 py-3 font-semibold text-primary">₹{c.spent}</td>
              <td className="px-4 py-3 text-xs">{new Date(c.lastOrderAt).toLocaleString()}</td>
              <td className="px-4 py-3 text-xs">
                <span className={`rounded-full px-2 py-0.5 font-bold ${c.storageBytes < 10240 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {c.storageBytes} bytes
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsManager({
  products,
  onChanged,
}: {
  products: Product[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    image: "",
    originalPrice: "",
    badge: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageFile = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
    setForm((current) => ({ ...current, image: dataUrl }));
  };

  const resetForm = () => {
    setForm({ id: "", name: "", price: "", description: "", image: "", originalPrice: "", badge: "" });
    setEditingId(null);
    setImagePreview("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) return;

    setBusy(true);
    const payload = {
      id: (form.id || form.name.toLowerCase().replace(/\s+/g, "-")).slice(0, 40),
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      image: form.image.trim(),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      badge: form.badge.trim() || undefined,
    };

    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      await createProduct(payload);
    }

    resetForm();
    setBusy(false);
    onChanged();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      description: p.description,
      image: p.image,
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      badge: p.badge || "",
    });
    setImagePreview(p.image);
  };

  const remove = async (id: string) => {
    setBusy(true);
    await deleteProduct(id);
    setBusy(false);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="rounded-2xl bg-card p-4 shadow-soft stitch-border space-y-3">
        <h3 className="text-lg font-extrabold">{editingId ? "Edit Product" : "Add New Product"}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="Product ID (optional)" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" required />
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" required />
          <input value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Original price (optional)" type="number" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Badge (optional)" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground md:col-span-2">
            <ImagePlus className="h-4 w-4" /> {imagePreview ? "Change image from device" : "Upload image from device"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        {imagePreview && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <img src={imagePreview} alt={form.name || "Product preview"} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Product image selected from device</p>
              <p className="text-xs text-muted-foreground">This image will be saved with the product.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setImagePreview("");
                setForm((current) => ({ ...current, image: "" }));
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Remove
            </button>
          </div>
        )}
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
        <div className="flex gap-2">
          <button disabled={busy} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Plus className="mr-1 inline h-4 w-4" /> {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-3">
        {products.filter((p) => p.active).map((p) => (
          <li key={p.id} className="rounded-2xl bg-card p-4 shadow-soft stitch-border">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.id}</p>
                <p className="mt-1 text-sm">{p.description}</p>
                <p className="mt-1 text-primary font-extrabold">₹{p.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin-edit/$kind/$id"
                  params={{ kind: "product", id: p.id }}
                  className="rounded-full border border-border p-2 hover:bg-muted"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => remove(p.id)} className="rounded-full border border-destructive/30 p-2 text-destructive hover:bg-destructive/10" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function FoundersManager({
  founders,
  onChanged,
}: {
  founders: Founder[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    degree: "",
    info: "",
    photoUrl: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePhotoFile = async (file: File | null) => {
    if (!file) return;
    const photoUrl = await fileToDataUrl(file);
    setForm((current) => ({ ...current, photoUrl }));
  };

  const resetForm = () => {
    setForm({ id: "", name: "", degree: "", info: "", photoUrl: "" });
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.degree.trim()) return;

    setBusy(true);
    const payload = {
      id: (form.id || form.name.toLowerCase().replace(/\s+/g, "-")).slice(0, 40),
      name: form.name.trim(),
      degree: form.degree.trim(),
      info: form.info.trim(),
      photoUrl: form.photoUrl.trim(),
    };

    if (editingId) {
      await updateFounder(editingId, payload);
    } else {
      await createFounder(payload);
    }

    resetForm();
    setBusy(false);
    onChanged();
  };

  const startEdit = (founder: Founder) => {
    setEditingId(founder.id);
    setForm({
      id: founder.id,
      name: founder.name,
      degree: founder.degree,
      info: founder.info,
      photoUrl: founder.photoUrl,
    });
  };

  const remove = async (id: string) => {
    setBusy(true);
    await deleteFounder(id);
    setBusy(false);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="rounded-2xl bg-card p-4 shadow-soft stitch-border space-y-3">
        <h3 className="text-lg font-extrabold">{editingId ? "Edit Founder" : "Add Founder"}</h3>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
          <ImagePlus className="h-4 w-4" /> Add name, degree, short info, and upload a photo from device.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="Founder ID (optional)" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Founder name" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" required />
          <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Degree" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" required />
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground md:col-span-2">
            <Camera className="h-4 w-4" />
            <span>{form.photoUrl ? "Change founder photo from device" : "Upload founder photo from device"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        {form.photoUrl && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <img src={form.photoUrl} alt="Founder preview" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Photo selected from device</p>
              <p className="text-xs text-muted-foreground">This will be saved as a compact local image string.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, photoUrl: "" }))}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Remove
            </button>
          </div>
        )}
        <textarea value={form.info} onChange={(e) => setForm({ ...form, info: e.target.value })} placeholder="Short bio / role" rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
        <div className="flex gap-2">
          <button disabled={busy} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Plus className="mr-1 inline h-4 w-4" /> {editingId ? "Update Founder" : "Add Founder"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-3">
        {founders.filter((founder) => founder.active).map((founder) => (
          <li key={founder.id} className="rounded-2xl bg-card p-4 shadow-soft stitch-border">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {founder.photoUrl ? (
                  <img src={founder.photoUrl} alt={founder.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-lg font-extrabold text-secondary-foreground ring-2 ring-border">
                    {founder.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold">{founder.name}</p>
                  <p className="text-xs text-muted-foreground">{founder.degree}</p>
                  <p className="mt-1 text-sm">{founder.info}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{founder.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin-edit/$kind/$id"
                  params={{ kind: "founder", id: founder.id }}
                  className="rounded-full border border-border p-2 hover:bg-muted"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => remove(founder.id)} className="rounded-full border border-destructive/30 p-2 text-destructive hover:bg-destructive/10" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
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
          className={`rounded-2xl bg-card p-4 shadow-soft stitch-border animate-slide-up ${!r.seenByAdmin ? "ring-2 ring-accent/50" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{r.customerName}</p>
              <p className="text-[11px] text-muted-foreground">
                Order {r.orderId} · {new Date(r.createdAt).toLocaleString()}
              </p>
              <div className="mt-1 flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
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
