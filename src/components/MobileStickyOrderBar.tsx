import { ShoppingCart, Utensils } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function MobileStickyOrderBar() {
  const { count, total, setOpen } = useCart();

  const goToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 p-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card stitch-border">
        <button
          type="button"
          onClick={goToMenu}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-bold text-foreground"
        >
          <Utensils className="h-4 w-4" />
          Menu
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ripple flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-extrabold text-primary-foreground shadow-soft"
        >
          <ShoppingCart className="h-4 w-4" />
          {count > 0 ? `${count} • ₹${total}` : "Order Now"}
        </button>
      </div>
    </div>
  );
}
