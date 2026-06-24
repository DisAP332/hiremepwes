"use client";

import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { reviewSchema, type ReviewInput } from "@/lib/validators";

export function ReviewForm() {
  const [message, setMessage] = useState("");
  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema) as Resolver<ReviewInput>,
    defaultValues: { initials: "", rating: 5, serviceUsed: "", body: "" },
  });

  const submit = async (values: ReviewInput) => {
    setMessage("Sending review for approval...");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Could not submit review.");
      return;
    }
    track("review_submitted");
    setMessage("Thank you! The review is pending approval before it appears publicly.");
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="card-pop p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label-cute">Initials shown publicly</span>
          <input className="input-cute" placeholder="S.R." {...form.register("initials")} />
        </label>
        <label>
          <span className="label-cute">Rating</span>
          <select className="input-cute" {...form.register("rating", { valueAsNumber: true })}>
            <option value={5}>5 stars</option>
            <option value={4}>4 stars</option>
            <option value={3}>3 stars</option>
            <option value={2}>2 stars</option>
            <option value={1}>1 star</option>
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label-cute">Service used</span>
          <input className="input-cute" placeholder="Cleaning reset, PC help, AI privacy checkup..." {...form.register("serviceUsed")} />
        </label>
        <label className="md:col-span-2">
          <span className="label-cute">Review</span>
          <textarea className="input-cute min-h-32" placeholder="What helped? What felt good?" {...form.register("body")} />
        </label>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink/60">{message}</p>
        <button className="btn-primary" type="submit">Leave review</button>
      </div>
    </form>
  );
}
