import { useEffect, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { getProducts, type Product } from "@/lib/storage";

export function BestSellerTicker() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    getProducts(false).then((items) => {
      if (mounted) setProducts(items.slice(0, 8));
    });

    return () => {
      mounted = false;
    };
  }, []);

  const trackItems = useMemo(() => {
    if (products.length === 0) return [];
    return [...products, ...products];
  }, [products]);

  if (trackItems.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-5 reveal">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/85 py-3 shadow-soft stitch-border">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />

        <div className="ticker-track">
          {trackItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="ticker-chip">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold">{item.name}</span>
              <span className="text-primary">₹{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
