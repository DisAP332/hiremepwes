import type { ServiceCategory } from "@/lib/validators";

export const SCHEDULE_TIME_ZONE = "America/New_York";
export const SCHEDULE_SLOT_HOURS = [9, 13, 17] as const;
export const SCHEDULE_SLOT_DURATION_HOURS = 3;
export const MAX_DAILY_SESSIONS = 2;
export const MAX_PUBLIC_SCHEDULE_DAYS = 42;

export type ScheduleSlotHour = (typeof SCHEDULE_SLOT_HOURS)[number];

export const quickBidServiceLabels: Record<
  Exclude<ServiceCategory, "custom_help">,
  string
> = {
  cleaning_reset: "Cleaning",
  pc_phone_repair: "Tech repair",
  ai_data_protection: "AI help",
  masks_crafts: "Crafts",
};

export function isScheduleSlotHour(value: number): value is ScheduleSlotHour {
  return SCHEDULE_SLOT_HOURS.includes(value as ScheduleSlotHour);
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function getDateKeyInTimeZone(
  date = new Date(),
  timeZone = SCHEDULE_TIME_ZONE,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return representedAsUtc - date.getTime();
}

export function zonedDateTimeToUtc(
  dateKey: string,
  hour: number,
  minute = 0,
  timeZone = SCHEDULE_TIME_ZONE,
): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const firstOffset = getTimeZoneOffsetMs(utcGuess, timeZone);
  const firstPass = new Date(utcGuess.getTime() - firstOffset);
  const correctedOffset = getTimeZoneOffsetMs(firstPass, timeZone);
  return new Date(utcGuess.getTime() - correctedOffset);
}

export function buildScheduleSlot(dateKey: string, startHour: number) {
  const startsAt = zonedDateTimeToUtc(dateKey, startHour);
  const endsAt = new Date(
    startsAt.getTime() + SCHEDULE_SLOT_DURATION_HOURS * 60 * 60 * 1000,
  );
  return { startsAt, endsAt };
}

export function getScheduleRange(startDateKey: string, days: number) {
  const endDateKey = addDaysToDateKey(startDateKey, days);
  return {
    startsAt: zonedDateTimeToUtc(startDateKey, 0),
    endsAt: zonedDateTimeToUtc(endDateKey, 0),
  };
}

export function normalizePhoneNumber(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits.length !== 10) return value;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function slotsOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return firstStart < secondEnd && firstEnd > secondStart;
}
