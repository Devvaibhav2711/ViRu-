import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍔</span>
          <span className="text-lg font-extrabold tracking-tight">
            ViRu <span className="text-gradient">Wadapav</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-card/80 p-1 md:flex">
          <Link to="/" className="rounded-full px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
            Home
          </Link>
          <Link to="/about" className="rounded-full px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
            About Us
          </Link>
          <a href="#menu" className="rounded-full px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
            Menu
          </a>
        </nav>
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
