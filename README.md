# HireMePwes

Bright, cute, mobile-first local service website for Serana Robins.

Built for:

- Cleaning & reset service
- PC / phone repair help
- AI data protection checkups
- Handmade masks & craft commissions

The homepage is intentionally simple: one screen, short copy, four service cards, and no scrolling sections below it. The style stays colorful and playful with bubbles, rounded cards, soft shadows, and a small witchy sparkle touch.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Redux Toolkit for booking UI state
- React Hook Form + Zod
- Prisma + Postgres
- Vercel Functions
- Vercel Blob uploads
- Resend email notifications
- Google Calendar integration scaffold
- Vercel Analytics

## Local setup

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Flow

1. Customer picks a service card.
2. The request form asks service-specific details.
3. Social profile link is required for in-person safety verification.
4. Photos are optional but appreciated.
5. Booking is saved as `pending`.
6. Serana reviews it in `/admin`.
7. Accepted bookings can create a Google Calendar event.

## Important env vars

```env
DATABASE_URL="postgresql://..."
ADMIN_SECRET="change-me-to-a-long-secret"
NEXT_PUBLIC_SITE_URL="https://hiremepwes.com"
NEXT_PUBLIC_BUSINESS_EMAIL="serana.robins1998@gmail.com"
NEXT_PUBLIC_BUSINESS_PHONE=""
NEXT_PUBLIC_INSTAGRAM_URL=""
NEXT_PUBLIC_FACEBOOK_URL=""
RESEND_API_KEY=""
NOTIFICATION_TO_EMAIL="serana.robins1998@gmail.com"
NOTIFICATION_FROM_EMAIL="HireMePwes <booking@hiremepwes.com>"
BLOB_READ_WRITE_TOKEN=""
GOOGLE_CLIENT_EMAIL=""
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID="primary"
```

## Google Calendar setup note

This project uses a service account style integration in `lib/calendar.ts`.
For production, create a dedicated booking calendar and share that calendar with the service account email.
