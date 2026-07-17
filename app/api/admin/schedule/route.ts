import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateKeyInTimeZone, getScheduleRange } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const range = getScheduleRange(getDateKeyInTimeZone(), 90);
  const [bids, events] = await Promise.all([
    prisma.scheduleBid.findMany({
      where: {
        startsAt: { gte: range.startsAt, lt: range.endsAt },
        status: { in: ["pending", "accepted"] },
      },
      orderBy: [{ status: "asc" }, { startsAt: "asc" }],
      take: 200,
    }),
    prisma.scheduleEvent.findMany({
      where: { startsAt: { gte: range.startsAt, lt: range.endsAt } },
      orderBy: { startsAt: "asc" },
      take: 200,
    }),
  ]);

  return Response.json(
    { bids, events },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
