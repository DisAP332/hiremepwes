"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Phone, Sparkles, X } from "lucide-react";

type SlotState = "available" | "maybe" | "booked" | "unavailable";
type Slot = {
  dateKey: string;
  startHour: number;
  startsAt: string;
  endsAt: string;
  state: SlotState;
  pendingBidCount: number;
  unavailableReason?: string | null;
};

type Service = {
  value: "cleaning_reset" | "pc_phone_repair" | "ai_data_protection" | "masks_crafts";
  label: string;
  emoji: string;
};

const services: Service[] = [
  { value: "cleaning_reset", label: "Cleaning", emoji: "🫧" },
  { value: "pc_phone_repair", label: "Tech repair", emoji: "💻" },
  { value: "ai_data_protection", label: "AI help", emoji: "🔮" },
  { value: "masks_crafts", label: "Crafts", emoji: "🎭" },
];

const stateStyles: Record<SlotState, string> = {
  available: "border-aqua-200 bg-aqua-100/80 hover:bg-aqua-200/80",
  maybe: "border-lemon-300 bg-lemon-100/90 hover:bg-lemon-200/90",
  booked: "border-lavender-200 bg-lavender-100/85 opacity-80",
  unavailable: "border-ink/5 bg-white/45 opacity-60",
};

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day + amount, 12);
  return dateKeyFromDate(date);
}

function startOfWeek(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return dateKeyFromDate(date);
}

function formatDate(dateKey: string, options?: Intl.DateTimeFormatOptions) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", options).format(new Date(year, month - 1, day, 12));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function slotLabel(slot: Slot) {
  if (slot.state === "available") return "Available";
  if (slot.state === "maybe") return `Maybe · ${slot.pendingBidCount} interested`;
  if (slot.state === "booked") return "Booked";
  if (slot.unavailableReason === "daily-limit") return "Daily limit reached";
  return "Unavailable";
}

export function ScheduleExperience() {
  const today = useMemo(() => dateKeyFromDate(new Date()), []);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [service, setService] = useState<Service["value"]>("cleaning_reset");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Loading schedule...");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setStatus("Loading schedule...");
    const response = await fetch(`/api/schedule?start=${weekStart}&days=14`, {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | { slots?: Slot[]; error?: string }
      | null;
    if (!response.ok || !payload?.slots) {
      setStatus(payload?.error ?? "Could not load availability.");
      return;
    }
    setSlots(payload.slots);
    setStatus("");
  }, [weekStart]);

  useEffect(() => {
    void load();
  }, [load]);

  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const mobileDates = Array.from({ length: 14 }, (_, index) => addDays(weekStart, index));
  const canGoBack = addDays(weekStart, 6) >= today;

  const openBid = (slot: Slot) => {
    if (slot.state !== "available" && slot.state !== "maybe") return;
    setSelected(slot);
    setStatus("");
  };

  const submitBid = async () => {
    if (!selected) return;
    setSubmitting(true);
    setStatus("Sending your quick bid...");
    const response = await fetch("/api/schedule/bids", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        serviceCategory: service,
        phone,
        dateKey: selected.dateKey,
        startHour: selected.startHour,
        website: "",
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setSubmitting(false);
    if (!response.ok) {
      setStatus(payload?.error ?? "Could not send your quick bid.");
      return;
    }
    setSelected(null);
    setPhone("");
    setStatus("Quick bid sent! Serana will review it before the time is booked.");
    await load();
  };

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-2xl shadow-lavender-200/25 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-raspberry-200/75 via-lemon-100 to-aqua-100 p-5 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-ink/65">
                <Sparkles className="size-4 text-raspberry-300" /> My schedule
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-5xl">
                Bid for a three-hour session.
              </h1>
              <p className="mt-3 max-w-2xl font-bold leading-7 text-ink/65">
                I accept a maximum of two three-hour sessions each day. A yellow “Maybe” slot already has interest, but you can still request it.
              </p>
            </div>
            <a className="btn-primary shrink-0" href="tel:+15135130522">
              <Phone className="mr-2 size-5" /> (513) 513-0522
            </a>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              disabled={!canGoBack}
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ChevronLeft className="mr-1 size-4" /> Previous
            </button>
            <div className="text-center">
              <p className="font-black text-ink">
                {formatDate(weekStart, { month: "short", day: "numeric" })} – {formatDate(addDays(weekStart, 6), { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-xs font-bold text-ink/50">Eastern Time</p>
            </div>
            <button
              className="btn-secondary px-4 py-2 text-sm"
              type="button"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              Next <ChevronRight className="ml-1 size-4" />
            </button>
          </div>

          <div className="mt-5 hidden overflow-x-auto lg:block">
            <div className="grid min-w-[920px] grid-cols-7 gap-2">
              {weekDates.map((dateKey) => (
                <div key={dateKey} className="rounded-2xl bg-white/65 p-2 text-center">
                  <p className="text-xs font-black uppercase tracking-wider text-ink/45">
                    {formatDate(dateKey, { weekday: "short" })}
                  </p>
                  <p className="text-lg font-black text-ink">
                    {formatDate(dateKey, { month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
              {[9, 13, 17].flatMap((hour) =>
                weekDates.map((dateKey) => {
                  const slot = slots.find((item) => item.dateKey === dateKey && item.startHour === hour);
                  if (!slot) return <div key={`${dateKey}-${hour}`} className="h-28 rounded-2xl bg-white/30" />;
                  return (
                    <button
                      key={`${dateKey}-${hour}`}
                      type="button"
                      disabled={slot.state === "booked" || slot.state === "unavailable"}
                      onClick={() => openBid(slot)}
                      className={`min-h-28 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed ${stateStyles[slot.state]}`}
                    >
                      <span className="block text-sm font-black text-ink">
                        {formatTime(slot.startsAt)}–{formatTime(slot.endsAt)}
                      </span>
                      <span className="mt-2 block text-xs font-black uppercase tracking-wide text-ink/60">
                        {slotLabel(slot)}
                      </span>
                      {(slot.state === "available" || slot.state === "maybe") && (
                        <span className="mt-3 inline-flex rounded-full bg-ink px-3 py-1 text-xs font-black text-white">Quick bid</span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <div className="mt-5 space-y-4 lg:hidden">
            {mobileDates.map((dateKey) => {
              const daySlots = slots.filter((slot) => slot.dateKey === dateKey);
              if (!daySlots.length) return null;
              return (
                <article key={dateKey} className="rounded-[1.5rem] bg-white/65 p-3 shadow-sm">
                  <h2 className="px-1 text-lg font-black text-ink">
                    {formatDate(dateKey, { weekday: "long", month: "short", day: "numeric" })}
                  </h2>
                  <div className="mt-3 space-y-2">
                    {daySlots.map((slot) => (
                      <button
                        key={slot.startsAt}
                        type="button"
                        disabled={slot.state === "booked" || slot.state === "unavailable"}
                        onClick={() => openBid(slot)}
                        className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left ${stateStyles[slot.state]}`}
                      >
                        <span>
                          <span className="block font-black text-ink">{formatTime(slot.startsAt)}–{formatTime(slot.endsAt)}</span>
                          <span className="block text-xs font-bold uppercase tracking-wide text-ink/55">{slotLabel(slot)}</span>
                        </span>
                        {(slot.state === "available" || slot.state === "maybe") && (
                          <span className="rounded-full bg-ink px-3 py-2 text-xs font-black text-white">Bid</span>
                        )}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {status ? <p className="mt-5 rounded-2xl bg-lemon-100 p-3 text-center text-sm font-black text-ink/70">{status}</p> : null}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-ink/35 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-raspberry-300">Quick bid</p>
                <h2 className="mt-1 text-2xl font-black text-ink">
                  {formatDate(selected.dateKey, { weekday: "long", month: "long", day: "numeric" })}
                </h2>
                <p className="font-bold text-ink/60">{formatTime(selected.startsAt)}–{formatTime(selected.endsAt)}</p>
              </div>
              <button type="button" className="rounded-full bg-lavender-100 p-2" onClick={() => setSelected(null)} aria-label="Close quick bid">
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-5 label-cute">What kind of help?</p>
            <div className="grid grid-cols-2 gap-2">
              {services.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setService(item.value)}
                  className={`rounded-2xl border p-3 text-left font-black transition ${service === item.value ? "border-raspberry-300 bg-raspberry-200/30" : "border-ink/10 bg-white"}`}
                >
                  <span className="mr-2 text-xl">{item.emoji}</span>{item.label}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="label-cute">Phone number</span>
              <input className="input-cute" inputMode="tel" autoComplete="tel" placeholder="(513) 555-1234" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <p className="mt-3 text-xs font-bold leading-5 text-ink/50">
              This sends a request, not an automatic booking. Serana must accept it before it appears as booked.
            </p>
            <button className="btn-primary mt-5 w-full" type="button" disabled={submitting} onClick={submitBid}>
              <CalendarDays className="mr-2 size-5" /> {submitting ? "Sending..." : "Send quick bid"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
