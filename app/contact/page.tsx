import { ContactForm } from "@/components/ContactForm";
import { SectionHeader } from "@/components/SectionHeader";
import { siteConfig } from "@/data/site";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeader
        eyebrow="Contact"
        title="Ask before you begin."
        body="The booking form is best for real requests, but this works for quick questions, unusual jobs, or craft ideas."
      />
      <div className="mb-6 rounded-[1.5rem] bg-white/70 p-4 text-center text-sm font-bold leading-6 text-ink/65 shadow-sm backdrop-blur">
        Email: {siteConfig.email} {siteConfig.phone ? ` · Phone/text: ${siteConfig.phone}` : ""}
      </div>
      <ContactForm />
    </main>
  );
}
