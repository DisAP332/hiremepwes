import { z } from "zod";

export const serviceCategorySchema = z.enum([
  "cleaning_reset",
  "pc_phone_repair",
  "ai_data_protection",
  "masks_crafts",
  "custom_help",
]);

export type ServiceCategory =
  | "cleaning_reset"
  | "pc_phone_repair"
  | "ai_data_protection"
  | "masks_crafts"
  | "custom_help";

export const quickBidServiceCategorySchema = z.enum([
  "cleaning_reset",
  "pc_phone_repair",
  "ai_data_protection",
  "masks_crafts",
]);

const optionalTrimmedString = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""));

const dateKeySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.");

const scheduleStartHourSchema = z.coerce
  .number()
  .int()
  .refine((value) => [9, 13, 17].includes(value), "Choose a valid time slot.");

const phoneNumberSchema = z
  .string()
  .trim()
  .min(10, "Please add a valid phone number.")
  .max(30, "Please add a valid phone number.");

export const bookingRequestSchema = z.object({
  serviceCategory: serviceCategorySchema,
  serviceLabel: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2, "Please add your name.").max(120),
  email: z.string().trim().email("Please add a valid email."),
  phone: optionalTrimmedString,
  socialLink: z
    .string()
    .trim()
    .min(2, "Please add a Facebook, Instagram, or other social handle.")
    .max(300)
    .refine(
      (value) =>
        /^https?:\/\/(www\.)?(facebook|instagram)\.com\/[^\s]+/i.test(value) ||
        /^Other:\s*\S+/i.test(value),
      "Please add a Facebook/Instagram handle or choose Other.",
    ),
  zipCode: z.string().trim().min(5).max(12),
  addressDetails: optionalTrimmedString,
  preferredDates: z.string().trim().min(3).max(800),
  availabilityNotes: optionalTrimmedString,
  urgency: z.string().trim().min(2).max(80),
  homeSize: optionalTrimmedString,
  intensity: z.coerce.number().min(1).max(5).optional(),
  hasSupplies: optionalTrimmedString,
  suppliesNote: optionalTrimmedString,
  deviceType: optionalTrimmedString,
  aiPrivacyConcern: optionalTrimmedString,
  budgetPreference: optionalTrimmedString,
  photoUrls: z.array(z.string().url()).max(8).default([]),
  notes: optionalTrimmedString,
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const quickBidSchema = z.object({
  serviceCategory: quickBidServiceCategorySchema,
  phone: phoneNumberSchema,
  dateKey: dateKeySchema,
  startHour: scheduleStartHourSchema,
  website: z.string().max(0).optional(),
});

export type QuickBidInput = z.infer<typeof quickBidSchema>;

export const adminScheduleBidActionSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const adminScheduleEventSchema = z
  .object({
    kind: z.enum(["session", "block"]),
    serviceCategory: quickBidServiceCategorySchema.optional(),
    phone: optionalTrimmedString,
    dateKey: dateKeySchema,
    startHour: scheduleStartHourSchema,
    publicLabel: z.string().trim().max(80).optional().or(z.literal("")),
    adminNote: optionalTrimmedString,
  })
  .superRefine((value, context) => {
    if (value.kind === "session" && !value.serviceCategory) {
      context.addIssue({
        code: "custom",
        path: ["serviceCategory"],
        message: "Choose a service for a work session.",
      });
    }
  });

export const contactMessageSchema = z.object({
  serviceCategory: serviceCategorySchema.optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: optionalTrimmedString,
  socialLink: optionalTrimmedString,
  message: z.string().trim().min(10).max(3000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const reviewSchema = z.object({
  initials: z.string().trim().min(1).max(8),
  rating: z.coerce.number().min(1).max(5),
  serviceUsed: z.string().trim().min(2).max(120),
  body: z.string().trim().min(10).max(1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const adminStatusSchema = z.object({
  status: z.enum([
    "pending",
    "accepted",
    "declined",
    "needs_followup",
    "completed",
    "cancelled",
    "hidden",
    "approved",
  ]),
  adminNote: optionalTrimmedString,
  scheduledStart: optionalTrimmedString,
  scheduledEnd: optionalTrimmedString,
});
