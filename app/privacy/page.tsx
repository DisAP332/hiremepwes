import { SectionHeader } from "@/components/SectionHeader";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Privacy" title="Simple privacy note" body="This page is intentionally plain so customers know what happens when they submit a form." />
      <article className="card-pop space-y-6 p-8 leading-8 text-ink/70">
        <section>
          <h2 className="text-2xl font-black text-ink">What is collected</h2>
          <p className="mt-2">Booking and contact forms may collect your name, email, phone number, social profile link, ZIP code, scheduling preferences, service notes, and optional photos you choose to upload.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">Why it is collected</h2>
          <p className="mt-2">This information is used to respond to your request, estimate the work, verify basic in-person safety, prepare for the appointment, and confirm scheduling.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">Reviews</h2>
          <p className="mt-2">Reviews are submitted privately. Only approved reviews are shown publicly, and public reviews show initials rather than full names.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">Analytics</h2>
          <p className="mt-2">The site may use privacy-conscious analytics to understand page visits, form starts, and form completions so the site can be improved.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-ink">No selling</h2>
          <p className="mt-2">Customer information should not be sold or publicly shared. Form details are for service communication and preparation.</p>
        </section>
      </article>
    </main>
  );
}
