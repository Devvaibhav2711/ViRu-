export function OfferBanner() {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="bg-gradient-offer animate-gradient rounded-2xl px-6 py-5 text-center shadow-soft stitch-border relative overflow-hidden">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl animate-wiggle hidden sm:block">🎁</span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl animate-wiggle hidden sm:block" style={{ animationDelay: "0.3s" }}>🚚</span>
        <p className="text-lg font-extrabold text-primary-foreground md:text-2xl">
          🔥 Order 10+ Wadapav & Get <span className="underline decoration-white">FREE Home Delivery</span>
        </p>
      </div>
    </section>
  );
}
