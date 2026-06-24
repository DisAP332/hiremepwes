import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminStatusSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const json = await request.json();
  const parsed = adminStatusSchema.safeParse(json);

  if (!parsed.success || !["approved", "hidden", "pending"].includes(parsed.data.status)) {
    return Response.json({ error: "Invalid review status." }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id },
    data: { status: parsed.data.status as never },
  });

  return Response.json({ ok: true, review });
}
