import { createFileRoute } from "@tanstack/react-router";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductShowcase } from "@/components/ProductShowcase";
import { OfferBanner } from "@/components/OfferBanner";
import { Menu } from "@/components/Menu";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <ProductShowcase />
          <OfferBanner />
          <Menu />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
