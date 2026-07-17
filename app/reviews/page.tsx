import { ReviewForm } from "@/components/ReviewForm";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getApprovedReviews() {
  try {
    return await prisma.review.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Reviews"
        title="Kind words, approved first"
        body="Reviews are submitted privately and only become public after Serana approves them. Public reviews show initials only."
      />

      <section className="grid gap-5 md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.id} className="card-pop p-6">
            <p className="text-lg font-black text-ink">
              {review.initials} · {"★".repeat(review.rating)}
            </p>
            <p className="mt-1 text-sm font-bold text-raspberry-300">
              {review.serviceUsed}
            </p>
            <p className="mt-4 text-sm leading-6 text-ink/65">
              “{review.body}”
            </p>
          </article>
        ))}
        {!reviews.length ? (
          <article className="card-pop p-6 md:col-span-3">
            <p className="text-lg font-black text-ink">
              No public reviews yet ✨
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/65">Much empty</p>
          </article>
        ) : null}
      </section>

      <section className="mx-auto mt-12 max-w-3xl">
        <SectionHeader
          eyebrow="Leave a review"
          title="Submit privately"
          body="Your initials can be shown publicly only after approval."
        />
        <ReviewForm />
      </section>
    </main>
  );
}
