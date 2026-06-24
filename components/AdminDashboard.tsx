"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Phone, RefreshCw } from "lucide-react";

type AdminNote = {
  id: string;
  body: string;
  createdAt: string;
};

type BookingRow = {
  id: string;
  status: string;
  serviceLabel: string;
  name: string;
  email: string;
  phone?: string | null;
  socialLink: string;
  zipCode: string;
  addressDetails?: string | null;
  preferredDates: string;
  availabilityNotes?: string | null;
  createdAt: string;
  notes?: string | null;
  photoUrls: string[];
  homeSize?: string | null;
  intensity?: number | null;
  hasSupplies?: string | null;
  suppliesNote?: string | null;
  deviceType?: string | null;
  aiPrivacyConcern?: string | null;
  budgetPreference?: string | null;
  adminNotes?: AdminNote[];
};

type ReviewRow = {
  id: string;
  status: string;
  initials: string;
  rating: number;
  serviceUsed: string;
  body: string;
  createdAt: string;
};

function mailtoFor(booking: BookingRow) {
  const subject = encodeURIComponent(`HireMePwes request: ${booking.serviceLabel}`);
  const body = encodeURIComponent(
    `Hi ${booking.name},\n\nThank you for your ${booking.serviceLabel} request. I reviewed your info and wanted to follow up about timing and details.\n\nPreferred timing you gave: ${booking.preferredDates}\n\n- Serana Robins`
  );
  return `mailto:${booking.email}?subject=${subject}&body=${body}`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "New",
    accepted: "Accepted",
    declined: "Declined",
    needs_followup: "Follow up",
    completed: "Complete",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

export function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Paste your ADMIN_SECRET to load requests.");

  const load = async () => {
    setMessage("Loading...");
    const [bookingRes, reviewRes] = await Promise.all([
      fetch("/api/admin/booking", { headers: { "x-admin-secret": secret } }),
      fetch("/api/admin/reviews", { headers: { "x-admin-secret": secret } }),
    ]);

    if (!bookingRes.ok || !reviewRes.ok) {
      setMessage("Could not load admin data. Check ADMIN_SECRET and DATABASE_URL.");
      return;
    }

    const bookingPayload = (await bookingRes.json()) as { bookings: BookingRow[] };
    const reviewPayload = (await reviewRes.json()) as { reviews: ReviewRow[] };
    setBookings(bookingPayload.bookings);
    setReviews(reviewPayload.reviews);
    setMessage("Loaded.");
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("hiremepwes-admin-secret");
    if (saved) setSecret(saved);
  }, []);

  const saveSecret = () => {
    window.localStorage.setItem("hiremepwes-admin-secret", secret);
    void load();
  };

  const setBookingStatus = async (id: string, status: string) => {
    setMessage(`Updating booking to ${statusLabel(status)}...`);
    const response = await fetch(`/api/admin/booking/${id}/status`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({
        status,
        adminNote: notes[id]?.trim() || undefined,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setMessage(response.ok ? "Booking updated." : payload?.error ?? "Could not update booking.");
    if (response.ok) {
      setNotes((current) => ({ ...current, [id]: "" }));
    }
    await load();
  };

  const setReviewStatus = async (id: string, status: string) => {
    setMessage(`Updating review to ${status}...`);
    const response = await fetch(`/api/admin/reviews/${id}/status`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ status }),
    });
    setMessage(response.ok ? "Review updated." : "Could not update review.");
    await load();
  };

  const copySummary = async (booking: BookingRow) => {
    const summary = [
      `${booking.serviceLabel} request`,
      `Name: ${booking.name}`,
      `Email: ${booking.email}`,
      booking.phone ? `Phone: ${booking.phone}` : null,
      `Social: ${booking.socialLink}`,
      `ZIP: ${booking.zipCode}`,
      booking.addressDetails ? `Area/details: ${booking.addressDetails}` : null,
      `Preferred: ${booking.preferredDates}`,
      booking.availabilityNotes ? `Availability notes: ${booking.availabilityNotes}` : null,
      booking.homeSize ? `Space/focus: ${booking.homeSize}` : null,
      booking.deviceType ? `Device: ${booking.deviceType}` : null,
      booking.aiPrivacyConcern ? `Privacy concern: ${booking.aiPrivacyConcern}` : null,
      booking.budgetPreference ? `Budget: ${booking.budgetPreference}` : null,
      booking.notes ? `Notes: ${booking.notes}` : null,
    ].filter(Boolean).join("\n");

    await navigator.clipboard.writeText(summary);
    setMessage("Request summary copied.");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card-pop p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-ink sm:text-3xl">Admin</h1>
            <p className="mt-2 text-sm text-ink/65">Review requests, contact people manually, update status, and approve reviews.</p>
          </div>
          <button className="btn-secondary w-fit px-4 py-2 text-sm" type="button" onClick={load}>
            <RefreshCw className="mr-2 size-4" /> Refresh
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input className="input-cute" type="password" placeholder="ADMIN_SECRET" value={secret} onChange={(event) => setSecret(event.target.value)} />
          <button className="btn-primary shrink-0" type="button" onClick={saveSecret}>Load</button>
        </div>
        <p className="mt-3 text-sm font-bold text-ink/60">{message}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-black text-ink sm:text-2xl">Requests</h2>
          {bookings.map((booking) => (
            <article key={booking.id} className="card-pop p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-ink">{booking.serviceLabel}</p>
                  <p className="text-sm text-ink/65">{booking.name} · {booking.email} · {booking.zipCode}</p>
                  {booking.phone ? <p className="text-sm text-ink/65">Phone: {booking.phone}</p> : null}
                </div>
                <span className="rounded-full bg-lemon-100 px-3 py-1 text-xs font-black text-ink">{statusLabel(booking.status)}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a className="btn-secondary px-4 py-2 text-sm" href={mailtoFor(booking)}><Mail className="mr-2 size-4" /> Email</a>
                {booking.phone ? <a className="btn-secondary px-4 py-2 text-sm" href={`sms:${booking.phone}`}><Phone className="mr-2 size-4" /> Text</a> : null}
                <a className="btn-secondary px-4 py-2 text-sm" href={booking.socialLink} target="_blank" rel="noreferrer"><MessageSquare className="mr-2 size-4" /> Social</a>
                <button className="btn-secondary px-4 py-2 text-sm" type="button" onClick={() => copySummary(booking)}>Copy summary</button>
              </div>

              <div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-ink/70">
                <p><strong>Preferred:</strong> {booking.preferredDates}</p>
                {booking.availabilityNotes ? <p><strong>Availability:</strong> {booking.availabilityNotes}</p> : null}
                {booking.addressDetails ? <p><strong>Area/details:</strong> {booking.addressDetails}</p> : null}
                {booking.homeSize ? <p><strong>Space/focus:</strong> {booking.homeSize}</p> : null}
                {booking.intensity ? <p><strong>Intensity:</strong> {booking.intensity}/5</p> : null}
                {booking.hasSupplies ? <p><strong>Supplies:</strong> {booking.hasSupplies}</p> : null}
                {booking.suppliesNote ? <p><strong>Supply notes:</strong> {booking.suppliesNote}</p> : null}
                {booking.deviceType ? <p><strong>Device:</strong> {booking.deviceType}</p> : null}
                {booking.aiPrivacyConcern ? <p><strong>AI/privacy:</strong> {booking.aiPrivacyConcern}</p> : null}
                {booking.budgetPreference ? <p><strong>Budget:</strong> {booking.budgetPreference}</p> : null}
                {booking.notes ? <p><strong>Notes:</strong> {booking.notes}</p> : null}
                {booking.photoUrls.length ? <p><strong>Photos:</strong> {booking.photoUrls.length} uploaded</p> : null}
              </div>

              {booking.adminNotes?.length ? (
                <div className="mt-3 rounded-2xl bg-lavender-100/60 p-4 text-sm leading-6 text-ink/70">
                  <p className="font-black text-ink">Private notes</p>
                  {booking.adminNotes.slice(-3).map((note) => <p key={note.id} className="mt-2">• {note.body}</p>)}
                </div>
              ) : null}

              <label className="mt-4 block">
                <span className="label-cute">Private note, optional</span>
                <textarea
                  className="input-cute min-h-20"
                  placeholder="Example: replied by text, waiting on photos, quoted $120..."
                  value={notes[booking.id] ?? ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [booking.id]: event.target.value }))}
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary px-4 py-2 text-sm" onClick={() => setBookingStatus(booking.id, "accepted")}>Accept</button>
                <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setBookingStatus(booking.id, "needs_followup")}>Follow up</button>
                <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setBookingStatus(booking.id, "declined")}>Decline</button>
                <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setBookingStatus(booking.id, "completed")}>Complete</button>
                <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setBookingStatus(booking.id, "cancelled")}>Cancel</button>
              </div>
            </article>
          ))}
          {!bookings.length ? <p className="rounded-3xl bg-white/60 p-5 text-sm font-bold text-ink/60">No requests loaded.</p> : null}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-ink sm:text-2xl">Reviews</h2>
          {reviews.map((review) => (
            <article key={review.id} className="card-pop p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-ink">{review.initials} · {"★".repeat(review.rating)}</p>
                  <p className="text-sm text-ink/60">{review.serviceUsed}</p>
                </div>
                <span className="rounded-full bg-lavender-100 px-3 py-1 text-xs font-black text-ink">{review.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/70">“{review.body}”</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary px-4 py-2 text-sm" onClick={() => setReviewStatus(review.id, "approved")}>Approve</button>
                <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setReviewStatus(review.id, "hidden")}>Hide</button>
              </div>
            </article>
          ))}
          {!reviews.length ? <p className="rounded-3xl bg-white/60 p-5 text-sm font-bold text-ink/60">No reviews loaded.</p> : null}
        </div>
      </div>
    </section>
  );
}
