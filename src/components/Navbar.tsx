import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="text-2xl">🍔</span>
          <span className="text-lg font-extrabold tracking-tight">
            ViRu <span className="text-gradient">Wadapav</span>
          </span>
        </a>
        <button
          onClick={() => setOpen(true)}
          className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground animate-pop">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
