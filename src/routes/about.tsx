import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AboutSection } from "@/components/AboutSection";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — ViRu Wadapav" },
      { name: "description", content: "Meet Vaibhav and Rohit, the founders of ViRu Wadapav, and learn about our startup story." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border/50 bg-gradient-hero animate-gradient text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">About Us</p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">Know the story behind Vaibhav and Rohit&apos;s startup</h1>
            <p className="mt-3 max-w-2xl text-sm opacity-90 md:text-base">
              Two friends, one startup dream, and one simple mission: build a local brand that feels
              personal, looks clean, and serves food people actually want to come back for.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-glow transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </section>

      <AboutSection />
    </main>
  );
}
