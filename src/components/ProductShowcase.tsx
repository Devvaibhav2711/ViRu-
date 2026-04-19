import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts, type Product } from "@/lib/storage";

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let mounted = true;
    getProducts(false).then((items) => {
      if (mounted) setProducts(items.slice(0, 6));
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (products.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % products.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [products.length]);

  const activeProduct = useMemo(() => products[active], [products, active]);

  if (!activeProduct) return null;

  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,oklch(0.8_0.16_75_/0.16),transparent_30%),radial-gradient(circle_at_90%_0%,oklch(0.62_0.2_27_/0.18),transparent_38%)]" />

      <div className="container mx-auto">
        <div className="mb-6 text-center md:mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Featured Slides</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Products in <span className="shimmer-text">Motion</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Swipe-worthy showcase with stitch-inspired cards.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
          <article className="relative overflow-hidden rounded-3xl bg-card shadow-card stitch-border">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,oklch(0.24_0.08_26_/0.64)_0%,transparent_55%)]" />
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="h-[280px] w-full object-cover md:h-[420px]"
            />

            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
              <div className="max-w-xl rounded-2xl border border-white/25 bg-black/45 p-4 text-white backdrop-blur-md md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Now showing</p>
                <h3 className="mt-1 text-2xl font-black md:text-3xl">{activeProduct.name}</h3>
                <p className="mt-1 text-sm text-white/85">{activeProduct.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-3xl font-black text-accent">₹{activeProduct.price}</span>
                  {activeProduct.originalPrice ? (
                    <span className="text-base text-white/65 line-through">₹{activeProduct.originalPrice}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActive((prev) => (prev - 1 + products.length) % products.length)}
                className="rounded-full border border-white/40 bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
                aria-label="Previous product"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActive((prev) => (prev + 1) % products.length)}
                className="rounded-full border border-white/40 bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
                aria-label="Next product"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {products.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(idx)}
                className={`group flex items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card ${
                  idx === active
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-border"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-xl object-cover ring-2 ring-border"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold group-hover:text-primary">{item.name}</p>
                  <p className="text-xs text-muted-foreground">₹{item.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {products.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Go to ${item.name}`}
              className={`h-2.5 rounded-full transition-all ${idx === active ? "w-8 bg-primary" : "w-2.5 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
