import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminStatusSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const json = await request.json();
  const parsed = adminStatusSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json({ error: "Invalid status update." }, { status: 400 });
  }

  if (["hidden", "approved"].includes(parsed.data.status)) {
    return Response.json({ error: "Invalid booking status." }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.update({
    where: { id },
    data: {
      status: parsed.data.status as never,
      adminNotes: parsed.data.adminNote
        ? { create: { body: parsed.data.adminNote } }
        : undefined,
    },
  });

  return Response.json({ ok: true, booking });
}
