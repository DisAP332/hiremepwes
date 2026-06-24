import { contactMessageSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = contactMessageSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid message." }, { status: 400 });
    }

    const message = await prisma.contactMessage.create({ data: parsed.data });
    await sendContactNotification(parsed.data);

    return Response.json({ ok: true, id: message.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not send contact message." }, { status: 500 });
  }
}
