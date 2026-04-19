import { useState, useRef } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { MenuItem } from "@/data/menu";
import { useCart } from "@/context/CartContext";
import { useScrollReveal } from "@/lib/effects";

export function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [bumping, setBumping] = useState(false);
  const [flying, setFlying] = useState(false);
  const ref = useScrollReveal<HTMLDivElement>();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAdd = () => {
    add(item, qty);
    
    // Calculate flying animation trajectory
    if (buttonRef.current) {
      const btn = buttonRef.current;
      const btnRect = btn.getBoundingClientRect();
      const cartIcon = document.querySelector('[aria-label="Open cart"]');
      
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const tx = cartRect.left - btnRect.left;
        const ty = cartRect.top - btnRect.top;
        
        // Create flying product element
        const flying = document.createElement('div');
        flying.className = 'fixed pointer-events-none animate-fly-product';
        flying.style.setProperty('--tx', `${tx}px`);
        flying.style.setProperty('--ty', `${ty}px`);
        flying.style.left = `${btnRect.left}px`;
        flying.style.top = `${btnRect.top}px`;
        flying.style.width = `${btnRect.width}px`;
        flying.style.height = `${btnRect.height}px`;
        flying.innerHTML = `<div class="w-full h-full bg-primary rounded-full flex items-center justify-center text-white font-bold">🍔</div>`;
        document.body.appendChild(flying);
        
        setTimeout(() => flying.remove(), 800);
      }
    }
    
    setBumping(true);
    setFlying(true);
    setTimeout(() => { setBumping(false); setFlying(false); }, 600);
    setQty(1);
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
      className="reveal lift-card group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-card shadow-card stitch-border"
    >
      {item.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-soft animate-pop">
          {item.badge} ₹{item.price}
        </span>
      )}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={640}
          height={640}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{item.name}</h3>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary">₹{item.price}</span>
          {item.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{item.originalPrice}</span>
          )}
        </div>
        <div className="mt-auto flex items-center gap-2">
          <div className="flex items-center rounded-full bg-secondary">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-muted active:animate-bounce-scale transition-all hover:scale-110"
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-muted active:animate-bounce-scale transition-all hover:scale-110"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            ref={buttonRef}
            onClick={handleAdd}
            className={`ripple flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all active:scale-95 hover:shadow-glow hover:scale-105 ${bumping ? "animate-wiggle" : ""}`}
          >
            <ShoppingBag className={`h-4 w-4 ${bumping ? "animate-pop" : ""}`} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
