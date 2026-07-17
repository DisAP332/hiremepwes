import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildScheduleSlot,
  MAX_DAILY_SESSIONS,
  normalizePhoneNumber,
} from "@/lib/schedule";
import { adminScheduleEventSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const parsed = adminScheduleEventSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid schedule item." },
      { status: 400 },
    );
  }

  const slot = buildScheduleSlot(parsed.data.dateKey, parsed.data.startHour);
  if (slot.startsAt <= new Date()) {
    return Response.json({ error: "That time has already passed." }, { status: 409 });
  }

  const phone = parsed.data.phone
    ? normalizePhoneNumber(parsed.data.phone)
    : null;
  if (parsed.data.phone && !phone) {
    return Response.json({ error: "Please add a valid US phone number." }, { status: 400 });
  }

  try {
    const event = await prisma.$transaction(
      async (tx) => {
        const [dailyCount, conflict] = await Promise.all([
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
        ]);

        if (parsed.data.kind === "session" && dailyCount >= MAX_DAILY_SESSIONS) {
          throw new Error("DAILY_LIMIT");
        }
        if (conflict) throw new Error("CONFLICT");

        return tx.scheduleEvent.create({
          data: {
            kind: parsed.data.kind,
            source: "manual",
            serviceCategory:
              parsed.data.kind === "session" ? parsed.data.serviceCategory : null,
            phone,
            publicLabel: parsed.data.publicLabel || null,
            adminNote: parsed.data.adminNote || null,
            dateKey: parsed.data.dateKey,
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
            countsTowardDailyLimit: parsed.data.kind === "session",
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return Response.json({ ok: true, event });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "DAILY_LIMIT") {
      return Response.json(
        { error: "That day already has two accepted sessions." },
        { status: 409 },
      );
    }
    if (code === "CONFLICT") {
      return Response.json(
        { error: "That time overlaps another calendar item." },
        { status: 409 },
      );
    }

    console.error("Could not create schedule event:", error);
    return Response.json({ error: "Could not add this calendar item." }, { status: 500 });
  }
}
