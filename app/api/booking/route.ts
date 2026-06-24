import { bookingRequestSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { sendBookingNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bookingRequestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }

    const booking = await prisma.bookingRequest.create({ data: parsed.data });
    await sendBookingNotification({ ...parsed.data, id: booking.id });

    return Response.json({ ok: true, id: booking.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not create booking request." }, { status: 500 });
  }
}
