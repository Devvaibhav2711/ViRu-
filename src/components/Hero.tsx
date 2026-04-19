import heroImg from "@/assets/hero-wadapav.jpg";
import { useEffect, useState } from "react";

export function Hero() {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLine((prev) => (prev + 1) % movingLines.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className="relative isolate min-h-[84vh] overflow-hidden">
      <img
        src={heroImg}
        alt="Hot crispy Vada Pav with green chutney"
        width={1280}
        height={960}
        className="hero-bg-image absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(120deg,oklch(0.24_0.09_26_/0.85)_0%,oklch(0.28_0.08_40_/0.76)_45%,oklch(0.58_0.14_72_/0.40)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,oklch(0.83_0.2_75_/0.25),transparent_34%),radial-gradient(circle_at_80%_12%,oklch(0.66_0.2_28_/0.23),transparent_34%)]" />

      <span className="absolute left-5 top-18 text-4xl opacity-70 md:left-10 md:top-14">🌶️</span>
      <span className="absolute right-6 top-18 text-5xl opacity-70 md:right-14 md:top-22">🍅</span>
      <span className="absolute bottom-16 left-1/3 text-3xl opacity-70">✨</span>

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl space-y-6 text-primary-foreground">
          <span className="inline-flex items-center rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] backdrop-blur">
            Street Taste Reloaded
          </span>

          <h1 className="text-balance text-4xl font-black leading-tight md:text-6xl">
            ViRu Wadapav
            <span className="block text-2xl font-semibold italic text-white/90 md:text-3xl">Ekda Kha, Punha Ya!</span>
          </h1>

          <div className="h-12 overflow-hidden rounded-full border border-white/30 bg-black/25 px-5 backdrop-blur-sm md:h-14">
            <p key={line} className="hero-line-move flex h-full items-center text-sm font-semibold uppercase tracking-[0.2em] text-white/95 md:text-base">
              {movingLines[line]}
            </p>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-2xl font-semibold text-white/60 line-through">₹15</span>
            <span className="text-5xl font-black md:text-6xl rounded-full p-3 animate-pulse-glow">
              ₹13
            </span>
            <span className="mb-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-soft animate-pop">
              TODAY OFFER
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={scrollToMenu}
              className="ripple rounded-full bg-white px-7 py-3 text-sm font-extrabold text-primary shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              Order Now
            </button>
            <a
              href="/#menu"
              className="rounded-full border border-white/40 bg-black/20 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              See Menu
            </a>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
            <Badge label="5k+ Orders" />
            <Badge label="Fresh Daily" />
            <Badge label="Fast Delivery" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-center text-xs font-bold tracking-wide text-white backdrop-blur-sm stitch-border">
      {label}
    </div>
  );
}

const movingLines = [
  "Crispy vada. Soft pav. Full on flavor.",
  "Made fresh every batch, every order.",
  "The dribbble-style street food experience.",
  "Spice, crunch and chutney in one bite.",
];
