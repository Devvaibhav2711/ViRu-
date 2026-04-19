import { useEffect, useState } from "react";
import { MenuCard } from "./MenuCard";
import { getProducts, type Product } from "@/lib/storage";

export function Menu() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    getProducts(false).then((list) => {
      if (mounted) setProducts(list);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="menu" className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">
          Our <span className="shimmer-text">Menu</span>
        </h2>
        <p className="mt-2 text-muted-foreground">Hot, fresh & made with love ❤️</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((item, i) => (
          <MenuCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
