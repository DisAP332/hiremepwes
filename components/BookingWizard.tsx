"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, UploadCloud } from "lucide-react";
import { track } from "@vercel/analytics";
import { type Resolver, useForm } from "react-hook-form";
import { bookingRequestSchema, type BookingRequestInput, type ServiceCategory } from "@/lib/validators";
import { serviceCards } from "@/data/site";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUploadedPhotoUrl, removeUploadedPhotoUrl, resetBookingWizard, setSelectedCategory, setStep } from "@/store/bookingSlice";

const chapters = ["Choose", "Details", "Timing", "Contact", "Review"] as const;

type FormField = keyof BookingRequestInput;

type SocialPlatform = "instagram" | "facebook" | "other";

const socialOptions: { value: SocialPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Other" },
];

function cleanSocialHandle(value: string) {
  return value.trim().replace(/^@+/, "");
}

function buildSocialValue(platform: SocialPlatform, rawHandle: string) {
  const handle = cleanSocialHandle(rawHandle);
  if (!handle) return "";

  if (platform === "instagram") {
    return `https://instagram.com/${handle}`;
  }

  if (platform === "facebook") {
    return `https://facebook.com/${handle}`;
  }

  if (/^https?:\/\//i.test(rawHandle.trim())) {
    return rawHandle.trim();
  }

  return `Other: ${handle}`;
}

const fieldsByStep: Record<number, FormField[]> = {
  0: ["serviceCategory", "serviceLabel"],
  1: [],
  2: ["preferredDates", "urgency"],
  3: ["name", "email", "zipCode", "socialLink"],
  4: ["serviceCategory", "serviceLabel", "preferredDates", "urgency", "name", "email", "zipCode", "socialLink"],
};

function findService(category?: string | null) {
  return serviceCards.find((service) => service.category === category) ?? serviceCards[0];
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-black text-red-600">{message}</p>;
}

export function BookingWizard() {
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const { step, selectedCategory, uploadedPhotoUrls } = useAppSelector((state) => state.bookingWizard);
  const startingService = useMemo(() => findService(params.get("service")), [params]);
  const [status, setStatus] = useState<"idle" | "uploading" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("instagram");
  const [socialHandle, setSocialHandle] = useState("");

  const form = useForm<BookingRequestInput>({
    resolver: zodResolver(bookingRequestSchema) as Resolver<BookingRequestInput>,
    defaultValues: {
      serviceCategory: startingService.category,
      serviceLabel: startingService.title,
      name: "",
      email: "",
      phone: "",
      socialLink: "",
      zipCode: "",
      addressDetails: "",
      preferredDates: "",
      availabilityNotes: "",
      urgency: "Same week is okay if available",
      homeSize: "",
      intensity: 3,
      hasSupplies: "not_sure",
      suppliesNote: "",
      deviceType: "",
      aiPrivacyConcern: "",
      budgetPreference: "$100 minimum / $30 hourly is okay",
      photoUrls: [],
      notes: "",
    },
  });

  const chosenCategory = form.watch("serviceCategory");
  const chosenService = findService(chosenCategory);

  useEffect(() => {
    dispatch(setSelectedCategory(startingService.category));
    form.setValue("serviceCategory", startingService.category, { shouldValidate: true });
    form.setValue("serviceLabel", startingService.title, { shouldValidate: true });
  }, [dispatch, form, startingService.category, startingService.title]);

  useEffect(() => {
    form.setValue("photoUrls", uploadedPhotoUrls, { shouldValidate: true });
  }, [form, uploadedPhotoUrls]);

  const selectService = (category: ServiceCategory) => {
    const service = findService(category);
    form.setValue("serviceCategory", service.category, { shouldValidate: true });
    form.setValue("serviceLabel", service.title, { shouldValidate: true });
    dispatch(setSelectedCategory(service.category));
    setServerMessage("");
    track("service_selected", { service: service.category });
  };

  const updateSocial = (platform: SocialPlatform, handle: string) => {
    setSocialPlatform(platform);
    setSocialHandle(handle);
    form.setValue("socialLink", buildSocialValue(platform, handle), { shouldValidate: true });
  };

  const goNext = async () => {
    const fields = fieldsByStep[step] ?? [];
    const valid = fields.length ? await form.trigger(fields, { shouldFocus: true }) : true;
    if (!valid) {
      setStatus("error");
      setServerMessage("A required detail is missing.");
      return;
    }
    setStatus("idle");
    setServerMessage("");
    dispatch(setStep(Math.min(step + 1, chapters.length - 1)));
  };

  const back = () => {
    setServerMessage("");
    dispatch(setStep(Math.max(step - 1, 0)));
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setStatus("uploading");
    setServerMessage("Uploading photos...");

    try {
      for (const file of Array.from(files).slice(0, 8 - uploadedPhotoUrls.length)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const payload = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !payload.url) throw new Error(payload.error ?? "Upload failed.");
        dispatch(addUploadedPhotoUrl(payload.url));
      }
      setStatus("idle");
      setServerMessage("Photos added. Thank you ✨");
      track("booking_photo_uploaded");
    } catch (error) {
      setStatus("error");
      setServerMessage(error instanceof Error ? error.message : "Photo upload failed.");
    }
  };

  const submit = async (values: BookingRequestInput) => {
    setStatus("submitting");
    setServerMessage("Sending your request...");

    const finalValues = {
      ...values,
      socialLink: buildSocialValue(socialPlatform, socialHandle) || values.socialLink,
    };

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(finalValues),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Something went wrong.");
      setStatus("success");
      setServerMessage("Request sent! Serana will review it and contact you to confirm.");
      track("booking_submitted", { service: finalValues.serviceCategory });
      form.reset();
      dispatch(resetBookingWizard());
    } catch (error) {
      setStatus("error");
      setServerMessage(error instanceof Error ? error.message : "Could not send request.");
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-4 rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-lavender-200/20 backdrop-blur-xl sm:mb-6 sm:rounded-[2rem]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-raspberry-300">Request form</p>
            <h1 className="mt-1 text-xl font-black text-ink sm:text-2xl">{chapters[step]}</h1>
          </div>
          <div className="rounded-full bg-lemon-100 px-3 py-1 text-xs font-black text-ink">{step + 1}/{chapters.length}</div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-white/80 p-1">
          <div className="h-full rounded-full bg-gradient-to-r from-raspberry-300 via-coral-300 to-aqua-300 transition-all" style={{ width: `${((step + 1) / chapters.length) * 100}%` }} />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {chapters.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => dispatch(setStep(index))}
              className={`focus-ring shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${index === step ? "bg-ink text-white" : "bg-white/75 text-ink/55 hover:bg-lemon-100"}`}
            >
              {index < step ? "✓ " : ""}{label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="card-pop p-4 sm:p-6 lg:p-8">
        {step === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-raspberry-300">Choose a service</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">What kind of help do you want?</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65 sm:text-base">Pick one card. The next step changes to match your choice.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {serviceCards.map((service) => {
                const selected = selectedCategory === service.category || chosenCategory === service.category;
                return (
                  <button
                    key={service.category}
                    type="button"
                    onClick={() => selectService(service.category)}
                    className={`sparkle-card rounded-[1.75rem] p-1 text-left transition hover:-translate-y-1 ${selected ? "bg-ink" : "bg-white/60"}`}
                  >
                    <div className="h-full rounded-[1.55rem] bg-white/90 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className={`grid size-14 place-items-center rounded-[1.25rem] bg-gradient-to-br ${service.accent} text-3xl`}>{service.emoji}</div>
                        <div>
                          <h3 className="text-lg font-black text-ink">{service.shortTitle}</h3>
                          <p className="text-xs font-black text-raspberry-300">{service.startingAt}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink/65">{service.tagline}</p>
                      {selected ? <p className="mt-3 rounded-full bg-lemon-100 px-3 py-2 text-center text-xs font-black text-ink">Selected ✨</p> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}

        {step === 1 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`rounded-[1.75rem] bg-gradient-to-br ${chosenService.accent} p-1`}>
              <div className="rounded-[1.55rem] bg-white/90 p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-raspberry-300">Selected service</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-4xl">{chosenService.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-black text-ink sm:text-3xl">{chosenService.shortTitle}</h2>
                    <p className="text-sm font-bold text-ink/60">{chosenService.questPrompt}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {chosenCategory === "cleaning_reset" ? (
                <>
                  <label>
                    <span className="label-cute">Room/home focus</span>
                    <input className="input-cute" placeholder="Kitchen + bath, one bedroom, whole apartment..." {...form.register("homeSize")} />
                  </label>
                  <label>
                    <span className="label-cute">Mess intensity: {form.watch("intensity") ?? 3}/5</span>
                    <input type="range" min="1" max="5" className="w-full accent-pink-500" {...form.register("intensity", { valueAsNumber: true })} />
                  </label>
                  <label>
                    <span className="label-cute">Can you offer supplies?</span>
                    <select className="input-cute" {...form.register("hasSupplies")}>
                      <option value="yes">Yes, I have supplies you can use</option>
                      <option value="some">Some supplies</option>
                      <option value="not_sure">Not sure</option>
                      <option value="no">No, please bring basics</option>
                    </select>
                  </label>
                  <label>
                    <span className="label-cute">Supply notes</span>
                    <input className="input-cute" placeholder="Vacuum, mop, sprays, trash bags..." {...form.register("suppliesNote")} />
                  </label>
                </>
              ) : null}

              {chosenCategory === "pc_phone_repair" ? (
                <label className="sm:col-span-2">
                  <span className="label-cute">Device / tech situation</span>
                  <input className="input-cute" placeholder="Windows PC, iPhone, Android, printer, Wi‑Fi, slow laptop..." {...form.register("deviceType")} />
                </label>
              ) : null}

              {chosenCategory === "ai_data_protection" ? (
                <label className="sm:col-span-2">
                  <span className="label-cute">Biggest privacy concern</span>
                  <input className="input-cute" placeholder="AI app privacy, account permissions, metadata, scams, safer sharing..." {...form.register("aiPrivacyConcern")} />
                </label>
              ) : null}

              {chosenCategory === "masks_crafts" ? (
                <div className="sm:col-span-2 rounded-[1.5rem] bg-lavender-100/70 p-4 text-sm leading-6 text-ink/70">
                  Tell me the mask/craft idea in the notes below. Useful clues: colors, size, vibe, deadline, reference images, and budget range.
                </div>
              ) : null}

              <label className="sm:col-span-2">
                <span className="label-cute">What would make this go well?</span>
                <textarea className="input-cute min-h-32" placeholder="A few practical details are perfect. No shame, no essay required." {...form.register("notes")} />
              </label>

              <div className="sm:col-span-2 rounded-[1.5rem] border border-dashed border-raspberry-200 bg-raspberry-200/10 p-4 sm:p-5">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
                  <UploadCloud className="size-8 text-raspberry-300" />
                  <span className="font-black text-ink">Optional photos</span>
                  <span className="max-w-md text-sm leading-6 text-ink/60">Photos help with estimates, but they are not required if you feel embarrassed or prefer privacy.</span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => uploadFiles(event.target.files)} />
                  <span className="btn-secondary px-4 py-2 text-sm">Choose photos</span>
                </label>
                {uploadedPhotoUrls.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {uploadedPhotoUrls.map((url) => (
                      <button key={url} type="button" onClick={() => dispatch(removeUploadedPhotoUrl(url))} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/70">
                        Photo added ✓ remove
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-raspberry-300">Timing</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink">When should this happen?</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">Same-week requests are okay. You are not booking instantly; Serana confirms first.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="label-cute">Preferred dates/times *</span>
                <textarea className="input-cute min-h-28" placeholder="Example: Any weekday after noon, this Saturday, mornings preferred..." {...form.register("preferredDates")} />
                <ErrorText message={form.formState.errors.preferredDates?.message} />
              </label>
              <label>
                <span className="label-cute">Urgency</span>
                <select className="input-cute" {...form.register("urgency")}>
                  <option>Same week is okay if available</option>
                  <option>As soon as possible</option>
                  <option>Flexible / no rush</option>
                  <option>I need a recurring service</option>
                </select>
              </label>
              <label>
                <span className="label-cute">Budget preference</span>
                <input className="input-cute" {...form.register("budgetPreference")} />
              </label>
              <label className="sm:col-span-2">
                <span className="label-cute">Anything else about availability?</span>
                <input className="input-cute" placeholder="Parking, pets, quiet hours, preferred contact times..." {...form.register("availabilityNotes")} />
              </label>
            </div>
          </motion.div>
        ) : null}

        {step === 3 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-raspberry-300">Contact</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink">How should Serana contact you?</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">A public social profile is required for basic in-person safety verification.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label-cute">Name *</span>
                <input className="input-cute" {...form.register("name")} />
                <ErrorText message={form.formState.errors.name?.message} />
              </label>
              <label>
                <span className="label-cute">Email *</span>
                <input className="input-cute" type="email" {...form.register("email")} />
                <ErrorText message={form.formState.errors.email?.message} />
              </label>
              <label>
                <span className="label-cute">Phone / text</span>
                <input className="input-cute" type="tel" {...form.register("phone")} />
              </label>
              <label>
                <span className="label-cute">ZIP code *</span>
                <input className="input-cute" {...form.register("zipCode")} />
                <ErrorText message={form.formState.errors.zipCode?.message} />
              </label>
              <div className="sm:col-span-2">
                <span className="label-cute">Social profile *</span>
                <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                  <select
                    className="input-cute"
                    value={socialPlatform}
                    onChange={(event) => updateSocial(event.target.value as SocialPlatform, socialHandle)}
                  >
                    {socialOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input-cute"
                    placeholder={socialPlatform === "other" ? "handle, name, or profile link" : "your handle"}
                    value={socialHandle}
                    onChange={(event) => updateSocial(socialPlatform, event.target.value)}
                  />
                </div>
                <input type="hidden" {...form.register("socialLink")} />
                <p className="mt-2 text-xs font-bold text-ink/50">Just a handle is okay. This is only for basic safety verification.</p>
                <ErrorText message={form.formState.errors.socialLink?.message} />
              </div>
              <label className="sm:col-span-2">
                <span className="label-cute">Address details, optional until confirmed</span>
                <input className="input-cute" placeholder="Neighborhood, cross streets, apartment access notes..." {...form.register("addressDetails")} />
              </label>
            </div>
          </motion.div>
        ) : null}

        {step === 4 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-raspberry-300">Review</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink">Send this request?</h2>
            <div className="mt-6 space-y-3 rounded-[1.5rem] bg-lemon-100 p-4 text-sm leading-6 text-ink/75 sm:p-5">
              <p><strong>Service:</strong> {chosenService.title}</p>
              <p><strong>Minimum:</strong> $100 / $30 hourly unless quoted differently.</p>
              <p><strong>Safety:</strong> Serana reviews your request and social profile before confirming.</p>
              <p><strong>Privacy:</strong> Your form info is only used to respond to your request and prepare the service.</p>
              {uploadedPhotoUrls.length ? <p><strong>Photos:</strong> {uploadedPhotoUrls.length} uploaded</p> : <p><strong>Photos:</strong> none, which is totally okay.</p>}
            </div>
            {Object.keys(form.formState.errors).length ? (
              <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                Some required fields need attention before sending. Use the step buttons above to jump back.
              </div>
            ) : null}
          </motion.div>
        ) : null}

        <div className="mt-7 border-t border-ink/10 pt-5">
          {serverMessage ? (
            <p className={`mb-4 rounded-2xl bg-white/75 p-3 text-sm font-bold ${status === "error" ? "text-red-600" : status === "success" ? "text-green-700" : "text-ink/60"}`}>{serverMessage}</p>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between">
            <button type="button" onClick={back} disabled={step === 0} className="btn-secondary px-4 py-3 disabled:cursor-not-allowed disabled:opacity-40">
              <ArrowLeft className="mr-2 size-4" /> Back
            </button>
            {step < chapters.length - 1 ? (
              <button type="button" onClick={goNext} className="btn-primary px-4 py-3">
                Next <ArrowRight className="ml-2 size-4" />
              </button>
            ) : (
              <button type="submit" disabled={status === "submitting" || status === "uploading"} className="btn-primary px-4 py-3 disabled:cursor-wait disabled:opacity-60">
                <CheckCircle2 className="mr-2 size-4" /> Send
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
