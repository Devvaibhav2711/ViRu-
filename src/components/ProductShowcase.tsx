import { useEffect, useMemo, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { getProducts, type Product } from "@/lib/storage";
import { useCart } from "@/context/CartContext";

export function ProductShowcase() {
  const { add } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [bumping, setBumping] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const transitionTo = (next: number) => {
    if (next === active || next < 0 || next >= products.length) return;
    setIncoming(next);
    window.setTimeout(() => {
      setActive(next);
      setIncoming(null);
    }, 600);
  };

  useEffect(() => {
    let mounted = true;
    getProducts(true).then((items) => {
      if (!mounted) return;
      const activeItems = items.filter((item) => item.active);
      const source = activeItems.length > 0 ? activeItems : items;
      setProducts(source.slice(0, 6));
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (products.length < 2) return;
    if (hovered) return;

    const timer = window.setInterval(() => {
      transitionTo((active + 1) % products.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [active, hovered, products.length]);

  const activeProduct = useMemo(() => products[active], [products, active]);
  const incomingProduct = useMemo(() => {
    if (incoming === null) return null;
    return products[incoming] ?? null;
  }, [incoming, products]);

  const handleAddToCart = () => {
    const currentProduct = incomingProduct ?? activeProduct;
    if (!currentProduct) return;
    
    add(currentProduct, 1);
    
    // Flying animation
    if (buttonRef.current) {
      const btn = buttonRef.current;
      const btnRect = btn.getBoundingClientRect();
      const cartIcon = document.querySelector('[aria-label="Open cart"]');
      
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const tx = cartRect.left - btnRect.left;
        const ty = cartRect.top - btnRect.top;
        
        const flying = document.createElement('div');
        flying.className = 'fixed pointer-events-none animate-fly-product';
        flying.style.setProperty('--tx', `${tx}px`);
        flying.style.setProperty('--ty', `${ty}px`);
        flying.style.left = `${btnRect.left}px`;
        flying.style.top = `${btnRect.top}px`;
        flying.style.width = `${btnRect.width}px`;
        flying.style.height = `${btnRect.height}px`;
        flying.innerHTML = `<div class="w-full h-full bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">🍔</div>`;
        document.body.appendChild(flying);
        
        setTimeout(() => flying.remove(), 800);
      }
    }
    
    setBumping(true);
    setTimeout(() => setBumping(false), 600);
  };

  if (!activeProduct) {
    return (
      <section className="relative overflow-hidden px-4 py-12 md:py-16">
        <div className="container mx-auto rounded-3xl border border-border bg-card p-8 text-center shadow-card stitch-border">
          <p className="text-lg font-bold">Slideshow is ready</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add products from Admin to display images and descriptions here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,oklch(0.8_0.16_75_/0.16),transparent_30%),radial-gradient(circle_at_90%_0%,oklch(0.62_0.2_27_/0.18),transparent_38%)]" />

      <div className="container mx-auto">
        <div className="mb-6 text-center md:mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Featured Slides</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Our <span className="shimmer-text">Specials</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* Main Image Display */}
          <article
            className="relative overflow-hidden rounded-3xl bg-gradient-card shadow-card stitch-border"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="relative aspect-square w-full md:aspect-auto md:h-[450px]">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className={`slide-layer h-full w-full object-cover ${incoming !== null ? "slide-layer-out" : "slide-layer-in"}`}
              />
              {incomingProduct ? (
                <img
                  src={incomingProduct.image}
                  alt={incomingProduct.name}
                  className="slide-layer h-full w-full object-cover slide-layer-next"
                />
              ) : null}
            </div>

            {/* Navigation Buttons - Top Right */}
            <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => transitionTo((active - 1 + products.length) % products.length)}
                className="rounded-full border border-white/40 bg-black/40 p-2.5 text-white backdrop-blur transition-all hover:bg-white/20 active:scale-90"
                aria-label="Previous product"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => transitionTo((active + 1) % products.length)}
                className="rounded-full border border-white/40 bg-black/40 p-2.5 text-white backdrop-blur transition-all hover:bg-white/20 active:scale-90"
                aria-label="Next product"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </article>

          {/* Right Sidebar - Product Details + Thumbnails */}
          <div className="flex flex-col gap-4">
            {/* Product Info Card */}
            <div className="rounded-2xl border border-border bg-gradient-card p-4 shadow-card stitch-border">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Now Showing</p>
              <h3 className="mt-2 text-2xl font-black md:text-3xl">{incomingProduct?.name ?? activeProduct.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{incomingProduct?.description ?? activeProduct.description}</p>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary">₹{incomingProduct?.price ?? activeProduct.price}</span>
                {(incomingProduct?.originalPrice ?? activeProduct.originalPrice) ? (
                  <span className="text-sm text-muted-foreground line-through">₹{incomingProduct?.originalPrice ?? activeProduct.originalPrice}</span>
                ) : null}
              </div>
              
              <button
                ref={buttonRef}
                onClick={handleAddToCart}
                className={`ripple w-full mt-4 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-all active:scale-95 hover:shadow-glow hover:scale-105 flex items-center justify-center gap-2 ${bumping ? 'animate-wiggle' : ''}`}
              >
                <ShoppingBag className={`h-5 w-5 ${bumping ? 'animate-pop' : ''}`} />
                Add to Cart
              </button>
            </div>

            {/* Thumbnail List */}
            <div className="grid gap-2">
              {products.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => transitionTo(idx)}
                  className={`group flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left shadow-soft transition-all hover:shadow-card ${
                    idx === (incoming ?? active)
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border hover:-translate-y-0.5"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold group-hover:text-primary">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="mt-6 flex justify-center gap-2">
          {products.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => transitionTo(idx)}
              aria-label={`Go to ${item.name}`}
              className={`h-2.5 rounded-full transition-all ${idx === (incoming ?? active) ? "w-8 bg-primary" : "w-2.5 bg-border hover:bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
