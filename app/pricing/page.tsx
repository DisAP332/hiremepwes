import { PriceCard } from "@/components/PriceCard";
import { SectionHeader } from "@/components/SectionHeader";
import { pricing } from "@/data/site";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Pricing" title="$100 minimum, $30/hour" body="Simple by default. Fixed quotes can be used for deep resets, custom masks, or larger jobs." />
      <div className="grid gap-5 md:grid-cols-3">
        {pricing.map((item) => <PriceCard key={item.name} item={item} />)}
      </div>
      <div className="card-pop mt-8 p-8">
        <h2 className="text-2xl font-black text-ink">Travel and scope notes</h2>
        <p className="mt-3 leading-8 text-ink/65">
          The normal service area is Cincinnati and surrounding areas within about 10 miles. Extra travel may include a small fee, always confirmed before scheduling. Cleaning customers who can provide supplies are appreciated, but it is not required.
        </p>
      </div>
    </main>
  );
}
