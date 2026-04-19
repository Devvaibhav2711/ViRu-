import { useState } from "react";
import { Star, X, Sparkles } from "lucide-react";
import { saveReview } from "@/lib/storage";

export function ReviewModal({
  orderId,
  customerName,
  onClose,
}: {
  orderId: string;
  customerName: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (rating === 0) return;
    await saveReview({ orderId, customerName, rating, comment: comment.trim() });
    setSubmitted(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_0.25s_ease-out]">
      <div className="relative mx-4 w-full max-w-md rounded-3xl bg-background p-6 shadow-card animate-[scale-in_0.3s_ease-out] stitch-border">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <Sparkles className="mx-auto h-14 w-14 text-accent animate-pop" />
            <h3 className="mt-3 text-2xl font-extrabold">Thanks {customerName}! 💛</h3>
            <p className="mt-2 text-muted-foreground">Your review means the world to us.</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="text-4xl">⭐</span>
              <h3 className="mt-2 text-2xl font-extrabold">How was your order?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tap the stars to rate us</p>
            </div>

            <div className="my-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className={`transition-transform ${active ? "scale-110" : "hover:scale-110"}`}
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        active ? "fill-accent text-accent drop-shadow-md" : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              placeholder="Tell us what you loved (optional)"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={300}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <button
              onClick={submit}
              disabled={rating === 0}
              className="mt-4 w-full rounded-full bg-gradient-offer py-3 text-base font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ripple"
            >
              Submit Review ✨
            </button>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-full py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}
