import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const event = await prisma.scheduleEvent.findUnique({
    where: { id },
    select: { id: true, bidId: true },
  });

  if (!event) {
    return Response.json({ error: "Calendar item not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.scheduleEvent.delete({ where: { id } });
    if (event.bidId) {
      await tx.scheduleBid.update({
        where: { id: event.bidId },
        data: { status: "cancelled" },
      });
    }
  });

  return Response.json({ ok: true });
}
