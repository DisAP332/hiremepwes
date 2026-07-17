import { prisma } from "@/lib/prisma";
import {
  addDaysToDateKey,
  buildScheduleSlot,
  getDateKeyInTimeZone,
  getScheduleRange,
  isDateKey,
  MAX_DAILY_SESSIONS,
  MAX_PUBLIC_SCHEDULE_DAYS,
  SCHEDULE_SLOT_HOURS,
  slotsOverlap,
} from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedStart = url.searchParams.get("start") ?? "";
  const parsedDays = Number(url.searchParams.get("days") ?? 14);
  const startDateKey = isDateKey(requestedStart) ? requestedStart : getDateKeyInTimeZone();
  const days = Number.isFinite(parsedDays)
    ? Math.min(Math.max(Math.trunc(parsedDays), 1), MAX_PUBLIC_SCHEDULE_DAYS)
    : 14;
  const range = getScheduleRange(startDateKey, days);
  const now = new Date();

  const [events, pendingBids] = await Promise.all([
    prisma.scheduleEvent.findMany({
      where: { startsAt: { lt: range.endsAt }, endsAt: { gt: range.startsAt } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.scheduleBid.findMany({
      where: { status: "pending", startsAt: { gte: range.startsAt, lt: range.endsAt } },
      select: { dateKey: true, startsAt: true },
    }),
  ]);

  const slots = Array.from({ length: days }).flatMap((_, dayIndex) => {
    const dateKey = addDaysToDateKey(startDateKey, dayIndex);
    const dailySessionCount = events.filter(
      (event) => event.dateKey === dateKey && event.kind === "session" && event.countsTowardDailyLimit,
    ).length;

    return SCHEDULE_SLOT_HOURS.map((startHour) => {
      const slot = buildScheduleSlot(dateKey, startHour);
      const event = events.find((candidate) =>
        slotsOverlap(candidate.startsAt, candidate.endsAt, slot.startsAt, slot.endsAt),
      );
      const pendingBidCount = pendingBids.filter(
        (bid) => bid.dateKey === dateKey && bid.startsAt.getTime() === slot.startsAt.getTime(),
      ).length;
      const isPast = slot.startsAt <= now;
      const state = isPast
        ? "unavailable"
        : event
          ? event.kind === "block" ? "unavailable" : "booked"
          : dailySessionCount >= MAX_DAILY_SESSIONS
            ? "unavailable"
            : pendingBidCount > 0 ? "maybe" : "available";

      return {
        dateKey,
        startHour,
        startsAt: slot.startsAt.toISOString(),
        endsAt: slot.endsAt.toISOString(),
        state,
        pendingBidCount,
        unavailableReason: isPast
          ? "past"
          : !event && dailySessionCount >= MAX_DAILY_SESSIONS
            ? "daily-limit"
            : event?.kind === "block" ? "blocked" : null,
      };
    });
  });

  return Response.json(
    { startDateKey, days, maxSessionsPerDay: MAX_DAILY_SESSIONS, slotDurationHours: 3, slots },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
