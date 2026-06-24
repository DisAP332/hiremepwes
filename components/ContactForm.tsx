"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/validators";
import { serviceCards } from "@/data/site";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const form = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", phone: "", socialLink: "", message: "" },
  });

  const submit = async (values: ContactMessageInput) => {
    setMessage("Sending...");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Could not send message.");
      return;
    }
    track("contact_submitted", { service: values.serviceCategory ?? "none" });
    setMessage("Message sent. Thank you ✨");
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="card-pop p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label-cute">Name</span>
          <input className="input-cute" {...form.register("name")} />
        </label>
        <label>
          <span className="label-cute">Email</span>
          <input className="input-cute" type="email" {...form.register("email")} />
        </label>
        <label>
          <span className="label-cute">Phone/text</span>
          <input className="input-cute" type="tel" {...form.register("phone")} />
        </label>
        <label>
          <span className="label-cute">Service</span>
          <select className="input-cute" {...form.register("serviceCategory")}>
            <option value="">Not sure yet</option>
            {serviceCards.map((service) => (
              <option key={service.category} value={service.category}>{service.shortTitle}</option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label-cute">Social link, optional here</span>
          <input className="input-cute" placeholder="Required only for booking requests" {...form.register("socialLink")} />
        </label>
        <label className="md:col-span-2">
          <span className="label-cute">Message</span>
          <textarea className="input-cute min-h-32" {...form.register("message")} />
        </label>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink/60">{message}</p>
        <button className="btn-primary" type="submit">Send message</button>
      </div>
    </form>
  );
}
