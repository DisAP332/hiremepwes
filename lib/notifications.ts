import twilio from "twilio";

type NewBookingNotification = {
  id: string;
  service?: string | null;
  name?: string | null;
  phone?: string | null;
};

function getAdminBookingUrl(bookingId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://hiremepwes.com";

  return `${baseUrl}/admin/booking/${bookingId}`;
}

export async function sendBookingSms(
  booking: NewBookingNotification,
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = process.env.BOOKING_NOTIFICATION_PHONE;

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    console.warn(
      "SMS notification skipped because Twilio environment variables are missing.",
    );
    return;
  }

  const client = twilio(accountSid, authToken);

  const details = [
    "New HireMePWES request",
    booking.service ? `Service: ${booking.service}` : null,
    booking.name ? `Name: ${booking.name}` : null,
    booking.phone ? `Customer: ${booking.phone}` : null,
    `Open: ${getAdminBookingUrl(booking.id)}`,
  ]
    .filter(Boolean)
    .join("\n");

  await client.messages.create({
    body: details,
    from: fromNumber,
    to: toNumber,
  });
}

export async function sendBookingDiscordNotification(
  booking: NewBookingNotification,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_BOOKING_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: [
        "🚨 **New HireMePWES request**",
        booking.service ? `**Service:** ${booking.service}` : null,
        booking.name ? `**Name:** ${booking.name}` : null,
        booking.phone ? `**Phone:** ${booking.phone}` : null,
        `**Admin:** ${getAdminBookingUrl(booking.id)}`,
      ]
        .filter(Boolean)
        .join("\n"),
      allowed_mentions: {
        parse: [],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Discord notification failed with status ${response.status}.`,
    );
  }
}
