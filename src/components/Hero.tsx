import heroImg from "@/assets/hero-wadapav.jpg";

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className="relative overflow-hidden bg-gradient-hero animate-gradient">
      {/* Floating emoji decorations */}
      <span className="absolute left-6 top-10 text-4xl animate-float opacity-70 hidden md:block" style={{ animationDelay: "0.2s" }}>🌶️</span>
      <span className="absolute right-10 top-20 text-5xl animate-float opacity-70 hidden md:block" style={{ animationDelay: "1s" }}>🍅</span>
      <span className="absolute left-1/3 bottom-10 text-3xl animate-float opacity-60 hidden md:block" style={{ animationDelay: "0.6s" }}>✨</span>

      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-2 md:py-20 md:gap-4 items-center relative z-10">
        <div className="text-primary-foreground space-y-6 animate-[fade-in_0.6s_ease-out]">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold backdrop-blur animate-bounce-in">
            ⭐ #1 Wadapav in town
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl drop-shadow-lg">
            ViRu Wadapav
          </h1>
          <p className="text-xl font-medium italic opacity-95 md:text-2xl">
            "Ekda Kha, Punha Ya!"
          </p>
          <div className="flex items-end gap-3 animate-slide-up">
            <span className="text-2xl line-through opacity-60">₹15</span>
            <span className="text-5xl font-extrabold drop-shadow-md md:text-6xl">₹13</span>
            <span className="mb-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground animate-pop">
              ONLINE OFFER
            </span>
          </div>
          <button
            onClick={scrollToMenu}
            className="ripple inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-primary shadow-glow transition-transform hover:scale-105 active:scale-95"
          >
            Order Now 🚀
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -m-8 rounded-full bg-accent/30 blur-3xl animate-pulse" />
          <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/20 blur-2xl animate-spin-slow" />
          <img
            src={heroImg}
            alt="Hot crispy Vada Pav with green chutney"
            width={1280}
            height={960}
            className="relative animate-float rounded-3xl shadow-card object-cover w-full aspect-[4/3] stitch-border"
          />
        </div>
      </div>
    </section>
  );
}
