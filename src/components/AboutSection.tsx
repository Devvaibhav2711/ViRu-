import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-wadapav.jpg";
import { Instagram, Youtube, Phone, Mail, MapPin, Clock3, GraduationCap, Users } from "lucide-react";
import { getFounders, type Founder } from "@/lib/storage";

export function AboutSection() {
  const [founders, setFounders] = useState<Founder[]>([]);

  useEffect(() => {
    let mounted = true;
    getFounders(false).then((items) => {
      if (mounted) setFounders(items);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="about" className="container mx-auto px-4 py-12 md:py-16 space-y-6">
      <div className="grid items-center gap-6 rounded-3xl border border-border bg-gradient-card p-5 shadow-card md:grid-cols-[1.05fr_1fr] md:p-8">
        <div className="relative">
          <div className="absolute -left-3 -top-3 h-16 w-16 rounded-full bg-accent/30 blur-2xl" />
          <img
            src={heroImg}
            alt="ViRu Wadapav special"
            width={1200}
            height={900}
            className="relative aspect-[4/3] w-full rounded-2xl object-cover stitch-border"
          />
        </div>

        <div className="space-y-4">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            ABOUT US
          </span>
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Fresh Street Taste,
            <span className="text-gradient"> Every Single Time</span>
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            ViRu Wadapav is built on one promise: hot, clean, fast, and full-flavor snacks for everyone.
            We prepare every order fresh and keep our recipes simple, tasty, and consistent.
          </p>

          <div className="grid gap-2 text-sm">
            <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Near Main Market, Pune</p>
            <p className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> Open daily: 10:00 AM - 10:30 PM</p>
            <a href="tel:+919876543210" className="inline-flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4 text-primary" /> +91 98765 43210</a>
            <a href="mailto:viruwadapav@gmail.com" className="inline-flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4 text-primary" /> viruwadapav@gmail.com</a>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <Youtube className="h-4 w-4 text-red-500" /> YouTube
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-card md:p-8">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Founders</span>
        </div>
        <h3 className="mt-2 text-2xl font-extrabold md:text-3xl">Two friends, one startup dream</h3>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
          ViRu Wadapav started with Vaibhav and Rohit sharing the same goal: build something real,
          useful, and honest. Vaibhav completed his BCA and brings the tech/product side,
          while Rohit completed his B.Tech and brings the operational and execution strength.
          Together they are building a startup that feels local, works fast, and serves food with care.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {founders.map((founder, index) => (
            <FounderCard key={founder.id} founder={founder} accent={index % 2 === 0 ? "primary" : "accent"} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderCard({
  founder,
  accent,
}: {
  founder: Founder;
  accent: "primary" | "accent";
}) {
  const ringClass = accent === "primary" ? "ring-primary/20" : "ring-accent/20";
  const badgeClass = accent === "primary" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground";
  const initials = founder.name.slice(0, 1).toUpperCase();

  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-soft">
      <div className="flex items-start gap-4">
        {founder.photoUrl ? (
          <img
            src={founder.photoUrl}
            alt={founder.name}
            className={`h-20 w-20 rounded-2xl object-cover ring-4 ${ringClass}`}
          />
        ) : (
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-background to-muted ring-4 ${ringClass}`}>
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${badgeClass} text-2xl font-extrabold`}>
              {initials}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div>
            <p className="text-lg font-extrabold">{founder.name}</p>
            <p className="text-xs text-muted-foreground">{founder.degree}</p>
          </div>
          <p className="text-sm text-muted-foreground">{founder.info}</p>
          <p className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
            <GraduationCap className="h-3.5 w-3.5" /> Founding partner
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
        {founder.photoUrl ? "Founder photo updated from admin." : `Photo slot ready. Add ${founder.name}&apos;s photo from admin.`}
      </div>
    </div>
  );
}