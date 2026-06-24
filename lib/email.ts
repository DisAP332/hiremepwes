import { Resend } from "resend";
import type { BookingRequestInput, ContactMessageInput, ReviewInput } from "@/lib/validators";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const toEmail = process.env.NOTIFICATION_TO_EMAIL ?? process.env.NEXT_PUBLIC_BUSINESS_EMAIL;
const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? "HireMePwes <onboarding@resend.dev>";

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2).replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char] ?? char));
}

async function sendNotification(subject: string, html: string) {
  if (!resend || !toEmail) {
    console.log(`[email skipped] ${subject}\n${html}`);
    return { skipped: true };
  }

  return resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject,
    html,
  });
}

export async function sendBookingNotification(booking: BookingRequestInput & { id?: string }) {
  return sendNotification(
    `New ${booking.serviceLabel} request from ${booking.name}`,
    `<h2>New booking request</h2><p><strong>Service:</strong> ${booking.serviceLabel}</p><pre>${prettyJson(booking)}</pre>`
  );
}

export async function sendContactNotification(message: ContactMessageInput) {
  return sendNotification(
    `New HireMePwes contact from ${message.name}`,
    `<h2>New contact message</h2><pre>${prettyJson(message)}</pre>`
  );
}

export async function sendReviewNotification(review: ReviewInput) {
  return sendNotification(
    `New review awaiting approval from ${review.initials}`,
    `<h2>New review awaiting approval</h2><pre>${prettyJson(review)}</pre>`
  );
}
