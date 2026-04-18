import { Instagram, Youtube, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-lg font-bold">We are Software Developers 💻</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Need a website for your business? Contact us
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-offer text-primary-foreground shadow-soft transition-transform hover:scale-110 hover:rotate-6"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform hover:scale-110 hover:-rotate-6"
          >
            <Youtube className="h-5 w-5" />
          </a>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} ViRu Wadapav. All rights reserved.
        </p>
        <Link
          to="/admin"
          className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-primary transition-colors"
        >
          <Lock className="h-3 w-3" /> Admin
        </Link>
      </div>
    </footer>
  );
}
