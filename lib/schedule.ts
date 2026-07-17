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
> =