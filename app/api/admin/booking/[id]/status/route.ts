import { del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminStatusSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
      select: {
        id: true,
        photoUrls: true,
      },
    });

    if (!booking) {
      return Response.json({ error: "Request not found." }, { status: 404 });
    }

    await prisma.bookingRequest.delete({
      where: { id },
    });

    // Best-effort cleanup for uploaded Vercel Blob images.
    // If this fails, the admin request still stays deleted.
    if (booking.photoUrls.length > 0) {
      del(booking.photoUrls).catch((error) => {
        console.warn("Could not delete booking photos from Blob:", error);
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Could not delete booking request:", error);

    return Response.json(
      { error: "Could not delete booking request." },
      { status: 500 },
    );
  }
}
