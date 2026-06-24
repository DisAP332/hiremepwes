import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return Response.json({ reviews });
}
