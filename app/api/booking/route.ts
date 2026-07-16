import { bookingRequestSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { sendBookingNotification } from "@/lib/email";
import {
  sendBookingDiscordNotification,
  sendBookingSms,
} from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bookingRequestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid request.",
        },
        { status: 400 },
      );
    }

    const booking = await prisma.bookingRequest.create({
      data: parsed.data,
    });

    const notificationData = {
      id: booking.id,

      // Change these property names only if your schema uses different names.
      name: "name" in parsed.data ? String(parsed.data.name ?? "") : null,
      phone: "phone" in parsed.data ? String(parsed.data.phone ?? "") : null,
      service:
        "service" in parsed.data ? String(parsed.data.service ?? "") : null,
    };

    const notificationResults = await Promise.allSettled([
      sendBookingNotification({
        ...parsed.data,
        id: booking.id,
      }),
      sendBookingSms(notificationData),
      sendBookingDiscordNotification(notificationData),
    ]);

    notificationResults.forEach((result, index) => {
      if (result.status === "rejected") {
        const notificationNames = ["email", "SMS", "Discord"];

        console.error(
          `${notificationNames[index]} booking notification failed:`,
          result.reason,
        );
      }
    });

    return Response.json({
      ok: true,
      id: booking.id,
    });
  } catch (error) {
    console.error("Booking creation failed:", error);

    return Response.json(
      { error: "Could not create booking request." },
      { status: 500 },
    );
  }
}
