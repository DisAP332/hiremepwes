import type { pricing } from "@/data/site";

type Price = (typeof pricing)[number];

export function PriceCard({ item }: { item: Price }) {
  return (
    <article className="card-pop p-6">
      <p className="text-lg font-black text-ink">{item.name}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-ink">{item.price}</p>
      <p className="mt-3 text-sm leading-6 text-ink/65">{item.detail}</p>
      <ul className="mt-5 space-y-2 text-sm text-ink/75">
        {item.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span>🫧</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
