import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { MenuItem } from "@/data/menu";

export type CartLine = MenuItem & { qty: number };

type CartCtx = {
  items: CartLine[];
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  add: (item: MenuItem, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);

  const add = (item: MenuItem, qty = 1) => {
    if (qty <= 0) return;
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      }
      return [...prev, { ...item, qty }];
    });
  };

  const setQty = (id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p)),
    );
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const { total, count } = useMemo(() => {
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    return { total, count };
  }, [items]);

  return (
    <Ctx.Provider value={{ items, isOpen, setOpen, add, setQty, remove, clear, total, count }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
