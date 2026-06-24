import { z } from "zod";

export const serviceCategorySchema = z.enum([
  "cleaning_reset",
  "pc_phone_repair",
  "ai_data_protection",
  "masks_crafts",
  "custom_help",
]);

export type ServiceCategory = z.infer<typeof serviceCategorySchema>;

const optionalTrimmedString = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""));

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
      "Please add a Facebook/Instagram handle or choose Other."
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
  status: z.enum(["pending", "accepted", "declined", "needs_followup", "completed", "cancelled", "hidden", "approved"]),
  adminNote: optionalTrimmedString,
  scheduledStart: optionalTrimmedString,
  scheduledEnd: optionalTrimmedString,
});
