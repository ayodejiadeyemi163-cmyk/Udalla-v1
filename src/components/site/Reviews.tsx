import { getStore } from "@/lib/store";

/**
 * Renders nothing until a real, approved review exists in the store.
 * No invented reviews, ratings or customer counts anywhere.
 */
export async function Reviews() {
  const store = getStore();
  const reviews = await store.listReviews(true);
  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-line bg-paper py-16">
      <div className="wrap">
        <p className="eyebrow mb-6">In their words</p>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <figure key={review.id} className="card p-6">
              <blockquote className="font-display text-[18px] leading-snug tracking-[-0.01em]">
                {review.body}
              </blockquote>
              <figcaption className="mt-4 text-[12px] uppercase tracking-[0.12em] text-muted">
                {review.name}, {review.country}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
