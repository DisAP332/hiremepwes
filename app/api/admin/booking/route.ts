import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      adminNotes: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return Response.json({ bookings });
}
