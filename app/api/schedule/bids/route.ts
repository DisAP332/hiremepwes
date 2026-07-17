import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendScheduleBidDiscordNotification,
  sendScheduleBidSms,
} from "@/lib/notifications";
import {
  addDaysToDateKey,
  buildScheduleSlot,
  getDateKeyInTimeZone,
  MAX_DAILY_SESSIONS,
  normalizePhoneNumber,
} from "@/lib/schedule";
import { quickBidSchema } from "@/lib