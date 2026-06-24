import Link from "next/link";
import { BadgeCheck, MapPin, Sparkles } from "lucide-react";
import { serviceCards, siteConfig } from "@/data/site";

const serviceLine: Record<string, string> = {
  cleaning_reset: "Home resets and cleaning",
  pc_phone_repair: "Device setup and repair help",
  ai_data_protection: "Privacy checkups for AI tools",
  masks_crafts: "Masks and handmade pieces",
};

export default function Home() {
  return (
    <main className="box-border min-h-[calc(100svh-4.5rem)] overflow-y-auto px-3 py-2 sm:px-6 sm:py-5 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-3 sm:gap-5 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <article className="card-pop p-3 sm:p-6 lg:p-8">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[0.7rem] font-black text-ink shadow-sm backdrop-blur sm:text-xs">
            <span>🫧</span>
            <span className="truncate">{siteConfig.serviceArea}</span>
          </div>

          <h1 className="mt-2 text-[2rem] font-black leading-[0.92] tracking-tight text-ink sm:mt-5 sm:text-6xl lg:text-7xl">
            Help from <span className="bg-gradient-to-r from-raspberry-300 via-coral-300 to-aqua-300 bg-clip-text text-transparent">Serana Robins.</span>
          </h1>

          <p className="mt-2 max-w-xl text-[0.92rem] font-bold leading-5 text-ink/65 sm:mt-3 sm:text-base sm:leading-7">
            Cleaning, repairs, AI privacy, and masks around Cincinnati.
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[0.66rem] font-black text-ink/70 sm:mt-6 sm:gap-3 sm:text-sm">
            <div className="rounded-2xl bg-lemon-100/85 p-2 sm:p-3"><BadgeCheck className="mb-1 size-3.5 text-raspberry-300 sm:size-5" />$100 min</div>
            <div className="rounded-2xl bg-aqua-100/85 p-2 sm:p-3"><Sparkles className="mb-1 size-3.5 text-raspberry-300 sm:size-5" />$30/hr</div>
            <div className="rounded-2xl bg-lavender-100/85 p-2 sm:p-3"><MapPin className="mb-1 size-3.5 text-raspberry-300 sm:size-5" />10 miles</div>
          </div>
        </article>

        <section aria-label="Choose a service" className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          {serviceCards.map((service) => (
            <Link
              key={service.category}
              href={`/book?service=${service.category}`}
              className="sparkle-card rounded-[1.35rem] bg-white/70 p-1 shadow-lg shadow-lavender-200/10 transition active:scale-[0.99] sm:rounded-[2rem] lg:hover:-translate-y-1"
            >
              <div className="flex h-full min-h-[6.8rem] flex-col justify-between rounded-[1.15rem] border border-white/70 bg-white/86 p-2.5 backdrop-blur sm:min-h-[11rem] sm:rounded-[1.75rem] sm:p-5 lg:min-h-[13rem]">
                <div>
                  <span className={`grid size-10 place-items-center rounded-[0.9rem] bg-gradient-to-br ${service.accent} text-2xl shadow-sm sm:size-16 sm:rounded-[1.35rem] sm:text-4xl`}>
                    {service.emoji}
                  </span>
                  <h2 className="mt-2 text-[0.95rem] font-black leading-tight text-ink sm:mt-3 sm:text-2xl">{service.shortTitle}</h2>
                  <p className="mt-1 hidden text-xs font-bold leading-4 text-ink/55 sm:block sm:text-sm sm:leading-5">{serviceLine[service.category]}</p>
                </div>
                <span className="mt-2 inline-flex items-center justify-center rounded-full bg-ink px-3 py-1.5 text-[0.72rem] font-black text-white sm:mt-3 sm:py-2 sm:text-sm">
                  Start →
                </span>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
