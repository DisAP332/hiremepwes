import { reviewSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { sendReviewNotification } from "@/lib/email";

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return Response.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = reviewSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid review." }, { status: 400 });
    }

    const review = await prisma.review.create({ data: parsed.data });
    await sendReviewNotification(parsed.data);

    return Response.json({ ok: true, id: review.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not submit review." }, { status: 500 });
  }
}
