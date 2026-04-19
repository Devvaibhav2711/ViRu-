import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, ImagePlus, Save } from "lucide-react";
import {
  getProducts,
  updateProduct,
  getFounders,
  updateFounder,
  type Product,
  type Founder,
} from "@/lib/storage";

type EditKind = "product" | "founder";

export const Route = createFileRoute("/admin-edit/$kind/$id")({
  head: () => ({
    meta: [{ title: "Edit Item — ViRu Wadapav" }],
  }),
  component: AdminEditPage,
});

function AdminEditPage() {
  const navigate = useNavigate();
  const { kind, id } = Route.useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [founder, setFounder] = useState<Founder | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (kind === "product") {
          const items = await getProducts(true);
          const current = items.find((item) => item.id === id) ?? null;
          if (mounted) {
            setProduct(current);
            setImagePreview(current?.image ?? "");
          }
        } else {
          const items = await getFounders(true);
          const current = items.find((item) => item.id === id) ?? null;
          if (mounted) {
            setFounder(current);
            setPhotoPreview(current?.photoUrl ?? "");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, kind]);

  const handlePhotoFile = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPhotoPreview(dataUrl);
  };

  const handleImageFile = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (kind === "product" && product) {
        await updateProduct(product.id, {
          name: product.name,
          price: product.price,
          description: product.description,
          image: imagePreview,
          originalPrice: product.originalPrice,
          badge: product.badge,
          active: product.active,
        });
      }

      if (kind === "founder" && founder) {
        await updateFounder(founder.id, {
          name: founder.name,
          degree: founder.degree,
          info: founder.info,
          photoUrl: photoPreview,
          active: founder.active,
        });
      }

      await navigate({ to: "/admin" });
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (kind === "product" && !product) {
    return <NotFoundPanel />;
  }

  if (kind === "founder" && !founder) {
    return <NotFoundPanel />;
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border/50 bg-gradient-hero animate-gradient text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">Admin Edit Page</p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">
              Edit {kind === "product" ? "Product" : "Founder"}
            </h1>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-glow transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Admin
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={save} className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-border bg-card p-5 shadow-card md:p-8">
          {kind === "product" && product && (
            <>
              <Field label="Name" value={product.name} onChange={(value) => setProduct({ ...product, name: value })} />
              <Field label="Price" value={String(product.price)} onChange={(value) => setProduct({ ...product, price: Number(value) || 0 })} type="number" />
              <Field label="Description" value={product.description} onChange={(value) => setProduct({ ...product, description: value })} textarea />
              <Field label="Original Price" value={product.originalPrice ? String(product.originalPrice) : ""} onChange={(value) => setProduct({ ...product, originalPrice: value ? Number(value) : undefined })} type="number" />

              <div className="space-y-2">
                <p className="text-sm font-semibold">Upload Product Image from Device</p>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground">
                  <ImagePlus className="h-4 w-4" /> Choose image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>

                {imagePreview && (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                    <img src={imagePreview} alt={product.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border" />
                    <p className="text-xs text-muted-foreground">Device image selected. Save to update the product card.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {kind === "founder" && founder && (
            <>
              <Field label="Name" value={founder.name} onChange={(value) => setFounder({ ...founder, name: value })} />
              <Field label="Degree" value={founder.degree} onChange={(value) => setFounder({ ...founder, degree: value })} />
              <Field label="Info" value={founder.info} onChange={(value) => setFounder({ ...founder, info: value })} textarea />

              <div className="space-y-2">
                <p className="text-sm font-semibold">Upload Founder Photo from Device</p>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground">
                  <ImagePlus className="h-4 w-4" /> Choose image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoFile(e.target.files?.[0] ?? null)}
                  />
                </label>

                {photoPreview && (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                    <img src={photoPreview} alt={founder.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border" />
                    <p className="text-xs text-muted-foreground">Device photo selected. Save to update the About page.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link to="/admin" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

function NotFoundPanel() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <h2 className="text-2xl font-extrabold">Item not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The record you tried to edit does not exist anymore.</p>
        <Link to="/admin" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>
      </div>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}