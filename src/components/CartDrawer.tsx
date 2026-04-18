import { useState } from "react";
import { Minus, Plus, Trash2, X, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { saveOrder } from "@/lib/storage";
import { fireConfetti } from "@/lib/effects";
import { ReviewModal } from "./ReviewModal";

export function CartDrawer() {
  const { isOpen, setOpen, items, setQty, remove, total, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [success, setSuccess] = useState(false);
  const [reviewFor, setReviewFor] = useState<{ orderId: string; name: string } | null>(null);

  const emailValid = /^\S+@\S+\.\S+$/.test(form.email);
  const phoneValid = form.phone.replace(/\D/g, "").length >= 10;
  const canOrder =
    items.length > 0 && form.name.trim() && phoneValid && emailValid && form.address.trim();

  const placeOrder = () => {
    if (!canOrder) return;
    const order = saveOrder({
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      },
      items,
      total,
    });
    setSuccess(true);
    fireConfetti(80);
    setTimeout(() => {
      setSuccess(false);
      setReviewFor({ orderId: order.id, name: form.name.trim() });
      clear();
      setForm({ name: "", phone: "", email: "", address: "" });
      setOpen(false);
    }, 2000);
  };

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-card transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-border p-4 bg-gradient-card">
          <h2 className="text-xl font-bold">Your Cart 🛒</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-2 hover:bg-muted transition-transform hover:rotate-90"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <span className="text-6xl animate-float">🍽️</span>
              <p className="mt-3">Your cart is empty</p>
              <p className="text-xs mt-1">Add some yummy items!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((line, idx) => (
                <li
                  key={line.id}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 animate-slide-up lift-card"
                >
                  <img
                    src={line.image}
                    alt={line.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{line.name}</p>
                    <p className="text-sm text-primary font-bold">₹{line.price * line.qty}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-secondary">
                    <button
                      onClick={() => setQty(line.id, line.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-transform"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{line.qty}</span>
                    <button
                      onClick={() => setQty(line.id, line.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-transform"
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(line.id)}
                    className="rounded-full p-1.5 text-destructive hover:bg-destructive/10 hover:rotate-12 transition-transform"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-border bg-card p-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                type="tel"
                placeholder="Phone number (10 digits)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <textarea
                placeholder="Delivery address"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-extrabold text-primary">₹{total}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={!canOrder}
              className="ripple w-full rounded-full bg-gradient-offer animate-gradient py-3 text-base font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Place Order 🚀
            </button>
          </div>
        )}
      </aside>

      {success && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="mx-4 max-w-sm rounded-3xl bg-background p-8 text-center shadow-card animate-bounce-in stitch-border">
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary animate-pop" />
            <h3 className="mt-4 text-2xl font-extrabold">Order Placed! 🎉</h3>
            <p className="mt-2 text-muted-foreground">
              Thanks {form.name}! We'll deliver your hot food soon.
            </p>
          </div>
        </div>
      )}

      {reviewFor && (
        <ReviewModal
          orderId={reviewFor.orderId}
          customerName={reviewFor.name}
          onClose={() => setReviewFor(null)}
        />
      )}
    </>
  );
}
