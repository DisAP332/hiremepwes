"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Phone, RefreshCw, Trash2 } from "lucide-react";

type Bid = {
  id: string;
  status: string;
  serviceCategory: string;
  phone: string;
  dateKey: string;
  startsAt: string;
  endsAt: string;
};

type Event = {
  id: string;
  kind: "session" | "block";
  source: string;
  serviceCategory?: string | null;
  phone?: string | null;
  publicLabel?: string | null;
  adminNote?: string | null;
  startsAt: string;
  endsAt: string;
};

const labels: Record<string, string> = {
  cleaning_reset: "Cleaning",
  pc_phone_repair: "Tech repair",
  ai_data_protection: "AI help",
  masks_crafts: "Crafts",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminSchedulePanel() {
  const [secret, setSecret] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [message, setMessage] = useState("Load your schedule with the same ADMIN_SECRET.");
  const [form, setForm] = useState({
    kind: "session",
    serviceCategory: "cleaning_reset",
    phone: "",
    dateKey: "",
    startHour: "9",
    publicLabel: "",
    adminNote: "",
  });

  useEffect(() => {
    setSecret(window.localStorage.getItem("hiremepwes-admin-secret") ?? "");
  }, []);

  const load = useCallback(async () => {
    if (!secret) {
      setMessage("Enter your ADMIN_SECRET above first.");
      return;
    }
    setMessage("Loading schedule...");
    const response = await fetch("/api/admin/schedule", {
      headers: { "x-admin-secret": secret },
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | { bids?: Bid[]; events?: Event[]; error?: string }
      | null;
    if (!response.ok) {
      setMessage(payload?.error ?? "Could not load schedule.");
      return;
    }
    setBids(payload?.bids ?? []);
    setEvents(payload?.events ?? []);
    setMessage("Schedule loaded.");
  }, [secret]);

  const saveAndLoad = () => {
    window.localStorage.setItem("hiremepwes-admin-secret", secret);
    void load();
  };

  const actOnBid = async (id: string, action: "accept" | "decline") => {
    setMessage(`${action === "accept" ? "Accepting" : "Declining"} bid...`);
    const response = await fetch(`/api/admin/schedule/bids/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ action }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setMessage(response.ok ? "Bid updated." : payload?.error ?? "Could not update bid.");
    if (response.ok) await load();
  };

  const createEvent = async () => {
    setMessage("Adding calendar item...");
    const response = await fetch("/api/admin/schedule/events", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({
        ...form,
        startHour: Number(form.startHour),
        serviceCategory: form.kind === "session" ? form.serviceCategory : undefined,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setMessage(response.ok ? "Calendar item added." : payload?.error ?? "Could not add item.");
    if (response.ok) {
      setForm((current) => ({ ...current, phone: "", publicLabel: "", adminNote: "" }));
      await load();
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm("Remove this calendar item?")) return;
    const response = await fetch(`/api/admin/schedule/events/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": secret },
    });
    setMessage(response.ok ? "Calendar item removed." : "Could not remove item.");
    if (response.ok) await load();
  };

  return (
    <section className="mt-6 space-y-6">
      <div className="card-pop p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-raspberry-300">My schedule</p>
            <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Quick bids and calendar</h2>
            <p className="mt-2 text-sm font-bold text-ink/60">Accept bids, block time, or manually add one of your two daily sessions.</p>
          </div>
          <button className="btn-secondary w-fit px-4 py-2 text-sm" type="button" onClick={load}>
            <RefreshCw className="mr-2 size-4" /> Refresh
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input className="input-cute" type="password" placeholder="ADMIN_SECRET" value={secret} onChange={(event) => setSecret(event.target.value)} />
          <button className="btn-primary shrink-0 px-5 py-2" type="button" onClick={saveAndLoad}>Load schedule</button>
        </div>
        <p className="mt-3 text-sm font-black text-ink/55">{message}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <h3 className="text-xl font-black text-ink">Pending quick bids</h3>
          {bids.filter((bid) => bid.status === "pending").map((bid) => (
            <article key={bid.id} className="rounded-[1.5rem] border border-lemon-200 bg-lemon-100/75 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-ink">{labels[bid.serviceCategory] ?? bid.serviceCategory}</p>
                  <p className="text-sm font-bold text-ink/60">{formatDateTime(bid.startsAt)} – {new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }).format(new Date(bid.endsAt))}</p>
                  <a className="mt-2 inline-flex items-center text-sm font-black text-ink" href={`sms:${bid.phone}`}><Phone className="mr-1.5 size-4" /> {bid.phone}</a>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase text-ink/60">Maybe</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary px-4 py-2 text-sm" type="button" onClick={() => actOnBid(bid.id, "accept")}>Accept</button>
                <button className="btn-secondary px-4 py-2 text-sm" type="button" onClick={() => actOnBid(bid.id, "decline")}>Decline</button>
              </div>
            </article>
          ))}
          {!bids.some((bid) => bid.status === "pending") ? <p className="rounded-2xl bg-white/60 p-4 text-sm font-bold text-ink/55">No pending quick bids.</p> : null}
        </div>

        <div className="card-pop h-fit p-4 sm:p-5">
          <h3 className="flex items-center text-xl font-black text-ink"><CalendarPlus className="mr-2 size-5 text-raspberry-300" /> Add session or block</h3>
          <div className="mt-4 grid gap-3">
            <label><span className="label-cute">Type</span><select className="input-cute" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}><option value="session">Work session</option><option value="block">Block personal time</option></select></label>
            {form.kind === "session" ? <label><span className="label-cute">Service</span><select className="input-cute" value={form.serviceCategory} onChange={(event) => setForm({ ...form, serviceCategory: event.target.value })}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : null}
            <div className="grid grid-cols-2 gap-3">
              <label><span className="label-cute">Date</span><input className="input-cute" type="date" value={form.dateKey} onChange={(event) => setForm({ ...form, dateKey: event.target.value })} /></label>
              <label><span className="label-cute">3-hour slot</span><select className="input-cute" value={form.startHour} onChange={(event) => setForm({ ...form, startHour: event.target.value })}><option value="9">9 AM–12 PM</option><option value="13">1–4 PM</option><option value="17">5–8 PM</option></select></label>
            </div>
            <label><span className="label-cute">Phone, optional</span><input className="input-cute" inputMode="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label><span className="label-cute">Public label, optional</span><input className="input-cute" placeholder="Busy, personal appointment..." value={form.publicLabel} onChange={(event) => setForm({ ...form, publicLabel: event.target.value })} /></label>
            <label><span className="label-cute">Private note, optional</span><textarea className="input-cute min-h-20" value={form.adminNote} onChange={(event) => setForm({ ...form, adminNote: event.target.value })} /></label>
            <button className="btn-primary" type="button" onClick={createEvent}>Add to calendar</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-black text-ink">Upcoming calendar</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <article key={event.id} className={`rounded-[1.5rem] border p-4 ${event.kind === "block" ? "border-ink/10 bg-white/60" : "border-lavender-200 bg-lavender-100/70"}`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-black text-ink">{event.kind === "block" ? event.publicLabel || "Blocked time" : labels[event.serviceCategory ?? ""] ?? "Work session"}</p><p className="text-sm font-bold text-ink/60">{formatDateTime(event.startsAt)}</p>{event.phone ? <a className="mt-2 block text-sm font-black text-ink" href={`sms:${event.phone}`}>{event.phone}</a> : null}</div>
                <button className="rounded-full bg-white/80 p-2 text-rose-600" type="button" onClick={() => deleteEvent(event.id)} aria-label="Remove calendar item"><Trash2 className="size-4" /></button>
              </div>
              {event.adminNote ? <p className="mt-3 text-sm text-ink/55">{event.adminNote}</p> : null}
            </article>
          ))}
        </div>
        {!events.length ? <p className="rounded-2xl bg-white/60 p-4 text-sm font-bold text-ink/55">No upcoming calendar items.</p> : null}
      </div>
    </section>
  );
}
