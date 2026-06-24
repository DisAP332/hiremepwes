import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { faqs, serviceCards } from "@/data/site";

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeader eyebrow="Services" title="Choose the card first." body="Each service opens a different version of the request form, so customers only see the details that matter." />
      <div className="grid gap-4 lg:grid-cols-2">
        {serviceCards.map((service) => <ServiceCard key={service.category} service={service} />)}
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/70 bg-white/65 p-4 shadow-xl shadow-lavender-200/10 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-raspberry-300">FAQ</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Tiny answers before booking.</h2>
          </div>
          <Link href="/book" className="btn-primary px-4 py-2 text-sm">Start request</Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-[1.25rem] bg-white/75 p-4">
              <summary className="cursor-pointer font-black text-ink">{faq.question}</summary>
              <p className="mt-2 text-sm leading-6 text-ink/65">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
