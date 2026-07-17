import twilio from "twilio";
import { quickBidServiceLabels } from "@/lib/schedule";
import type { ServiceCategory } from "@/lib/validators";

type NewBookingNotification = {
  id: string;
  service?: string | null;
  name?: string | null;
  phone?: string | null;
};

type NewScheduleBidNotification = {
  id: string;
  serviceCategory: Exclude<ServiceCategory, "custom_help">;
  phone: string;
  startsAt: Date;
};

function getAdminBookingUrl(bookingId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://hiremepwes.com";
  return `${baseUrl}/admin/booking/${bookingId}`;
}

function getAdminScheduleUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://hiremepwes.com";
  return `${baseUrl}/admin#schedule`;
}

function formatBidTime(startsAt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(startsAt);
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

  await client.messages.create({ body: details, from: fromNumber, to: toNumber });
}

export async function sendBookingDiscordNotification(
  booking: NewBookingNotification,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_BOOKING_WEBHOOK_URL;
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
      allowed_mentions: { parse: [] },
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord notification failed with status ${response.status}.`);
  }
}

export async function sendScheduleBidSms(
  bid: NewScheduleBidNotification,
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = process.env.BOOKING_NOTIFICATION_PHONE;
  if (!accountSid || !authToken || !fromNumber || !toNumber) return;

  const client = twilio(accountSid, authToken);
  await client.messages.create({
    body: [
      "New HireMePWES quick bid",
      `Service: ${quickBidServiceLabels[bid.serviceCategory]}`,
      `Time: ${formatBidTime(bid.startsAt)}`,
      `Customer: ${bid.phone}`,
      `Open: ${getAdminScheduleUrl()}`,
    ].join("\n"),
    from: fromNumber,
    to: toNumber,
  });
}

export async function sendScheduleBidDiscordNotification(
  bid: NewScheduleBidNotification,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_BOOKING_WEBHOOK_URL;
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: [
        "🗓️ **New HireMePWES quick bid**",
        `**Service:** ${quickBidServiceLabels[bid.serviceCategory]}`,
        `**Time:** ${formatBidTime(bid.startsAt)}`,
        `**Phone:** ${bid.phone}`,
        `**Admin:** ${getAdminScheduleUrl()}`,
      ].join("\n"),
      allowed_mentions: { parse: [] },
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord notification failed with status ${response.status}.`);
  }
}
