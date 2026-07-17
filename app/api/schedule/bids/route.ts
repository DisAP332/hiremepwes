import { prisma } from "@/lib/prisma";
import {
  addDaysToDateKey,
  buildScheduleSlot,
  getDateKeyInTimeZone,
  MAX_DAILY_SESSIONS,
  normalizePhoneNumber,
} from "@/lib/schedule";
import { quickBidSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const parsed = quickBidSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid quick bid." },
        { status: 400 },
      );
    }

    const phone = normalizePhoneNumber(parsed.data.phone);
    if (!phone) {
      return Response.json(
        { error: "Please add a valid US phone number." },
        { status: 400 },
      );
    }

    const today = getDateKeyInTimeZone();
    const lastBookableDate = addDaysToDateKey(today, 90);
    if (parsed.data.dateKey < today || parsed.data.dateKey > lastBookableDate) {
      return Response.json(
        { error: "Choose a date within the next 90 days." },
        { status: 400 },
      );
    }

    const slot = buildScheduleSlot(parsed.data.dateKey, parsed.data.startHour);
    if (slot.startsAt <= new Date()) {
      return Response.json(
        { error: "That time has already passed." },
        { status: 409 },
      );
    }

    const bid = await prisma.$transaction(async (tx) => {
      const [dailySessionCount, conflictingEvent, existingBid] = await Promise.all([
        tx.scheduleEvent.count({
          where: {
            dateKey: parsed.data.dateKey,
            kind: "session",
            countsTowardDailyLimit: true,
          },
        }),
        tx.scheduleEvent.findFirst({
          where: {
            startsAt: { lt: slot.endsAt },
            endsAt: { gt: slot.startsAt },
          },
          select: { id: true },
        }),
        tx.scheduleBid.findFirst({
          where: {
            phone,
            startsAt: slot.startsAt,
            status: { in: ["pending", "accepted"] },
          },
          select: { id: true },
        }),
      ]);

      if (dailySessionCount >= MAX_DAILY_SESSIONS) throw new Error("DAILY_LIMIT");
      if (conflictingEvent) throw new Error("SLOT_UNAVAILABLE");
      if (existingBid) throw new Error("DUPLICATE_BID");

      return tx.scheduleBid.create({
        data: {
          serviceCategory: parsed.data.serviceCategory,
          phone,
          dateKey: parsed.data.dateKey,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
        },
      });
    });

    return Response.json({ ok: true, id: bid.id });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        DAILY_LIMIT: "That day already has two accepted sessions.",
        SLOT_UNAVAILABLE: "That time is no longer available.",
        DUPLICATE_BID: "This phone number already requested that time.",
      };
      if (messages[error.message]) {
        return Response.json({ error: messages[error.message] }, { status: 409 });
      }
    }

    console.error("Quick bid creation failed:", error);
    return Response.json(
      { error: "Could not send your quick bid." },
      { status: 500 },
    );
  }
}
