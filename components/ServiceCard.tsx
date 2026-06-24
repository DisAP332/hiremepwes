import Link from "next/link";
import type { ServiceCard as ServiceCardType } from "@/data/site";

export function ServiceCard({ service }: { service: ServiceCardType }) {
  return (
    <article className="sparkle-card card-pop group p-1">
      <div className="h-full rounded-[1.85rem] bg-white/85 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className={`grid size-14 shrink-0 place-items-center rounded-[1.35rem] bg-gradient-to-br ${service.accent} text-3xl shadow-lg shadow-ink/5 transition group-hover:scale-105 sm:size-16 sm:text-4xl`}>
            {service.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-raspberry-300">Service</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-ink sm:text-2xl">{service.shortTitle}</h3>
            <p className="mt-1 text-sm font-bold leading-5 text-ink/60">{service.tagline}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] bg-lemon-50/80 p-4">
          <p className="text-sm font-black text-ink">{service.questPrompt}</p>
          <ol className="mt-3 space-y-2 text-sm text-ink/68">
            {service.storySteps.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-ink">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="rounded-full bg-lavender-100 px-3 py-1 text-center text-xs font-black text-ink">{service.startingAt}</span>
          <Link href={`/book?service=${service.category}`} className="btn-primary px-4 py-2 text-sm">
            Start request ✨
          </Link>
        </div>
      </div>
    </article>
  );
}
