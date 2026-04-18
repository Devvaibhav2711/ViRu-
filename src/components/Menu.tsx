import { menuItems } from "@/data/menu";
import { MenuCard } from "./MenuCard";

export function Menu() {
  return (
    <section id="menu" className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">Our Menu</h2>
        <p className="mt-2 text-muted-foreground">Hot, fresh & made with love ❤️</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {menuItems.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
