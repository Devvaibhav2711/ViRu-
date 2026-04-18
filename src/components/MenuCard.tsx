import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { MenuItem } from "@/data/menu";
import { useCart } from "@/context/CartContext";

export function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [bumping, setBumping] = useState(false);

  const handleAdd = () => {
    add(item, qty);
    setBumping(true);
    setTimeout(() => setBumping(false), 400);
    setQty(1);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-card shadow-card transition-transform hover:-translate-y-1">
      {item.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-soft">
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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-bold">{item.name}</h3>
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
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-muted"
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-muted"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform active:scale-95 hover:bg-primary/90 ${bumping ? "animate-pop" : ""}`}
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
