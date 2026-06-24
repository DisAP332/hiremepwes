import { Suspense } from "react";
import { BookingWizard } from "@/components/BookingWizard";

export default function BookPage() {
  return (
    <main>
      <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-20 text-center font-black text-ink">Loading sparkle form...</div>}>
        <BookingWizard />
      </Suspense>
    </main>
  );
}
