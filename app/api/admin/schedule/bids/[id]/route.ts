import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_DAILY_SESSIONS } from "@/lib/schedule";
import { adminScheduleBidActionSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const parsed = adminScheduleBidActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid bid action." }, { status: 400 });
  }

  if (parsed.data.action === "decline") {
    const bid = await prisma.scheduleBid.update({
      where: { id },
      data: { status: "declined" },
    });
    return Response.json({ ok: true, bid });
  }

  try {
    const event = await prisma.$transaction(
      async (tx) => {
        const bid = await tx.scheduleBid.findUnique({ where: { id } });
        if (!bid) throw new Error("NOT_FOUND");
        if (bid.status !== "pending") throw new Error("NOT_PENDING");
        if (bid.startsAt <= new Date()) throw new Error("PAST_SLOT");

        const [dailyCount, conflict] = await Promise.all([
          tx.scheduleEvent.count({
            where: {
              dateKey: bid.dateKey,
              kind: "session",
              countsTowardDailyLimit: true,
            },
          }),
          tx.scheduleEvent.findFirst({
            where: {
              startsAt: { lt: bid.endsAt },
              endsAt: { gt: bid.startsAt },
            },
            select: { id: true },
          }),
        ]);

        if (dailyCount >= MAX_DAILY_SESSIONS) throw new Error("DAILY_LIMIT");
        if (conflict) throw new Error("CONFLICT");

        const created = await tx.scheduleEvent.create({
          data: {
            kind: "session",
            source: "quick_bid",
            serviceCategory: bid.serviceCategory,
            phone: bid.phone,
            dateKey: bid.dateKey,
            startsAt: bid.startsAt,
            endsAt: bid.endsAt,
            countsTowardDailyLimit: true,
            bidId: bid.id,
          },
        });

        await tx.scheduleBid.update({ where: { id: bid.id }, data: { status: "accepted" } });
        await tx.scheduleBid.updateMany({
          where: {
            id: { not: bid.id },
            startsAt: bid.startsAt,
            status: "pending",
          },
          data: { status: "declined" },
        });

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return Response.json({ ok: true, event });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const messages: Record<string, [string, number]> = {
      NOT_FOUND: ["Bid not found.", 404],
      NOT_PENDING: ["This bid is no longer pending.", 409],
      PAST_SLOT: ["That time has already passed.", 409],
      DAILY_LIMIT: ["That day already has two accepted sessions.", 409],
      CONFLICT: ["That time overlaps another calendar item.", 409],
    };
    const known = messages[code];
    if (known) return Response.json({ error: known[0] }, { status: known[1] });

    console.error("Could not accept schedule bid:", error);
    return Response.json({ error: "Could not accept this bid." }, { status: 500 });
  }
}
