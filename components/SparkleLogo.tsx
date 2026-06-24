import Link from "next/link";
import { siteConfig } from "@/data/site";

export function SparkleLogo() {
  return (
    <Link href="/" className="focus-ring inline-flex min-w-0 items-center gap-2 rounded-full sm:gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lemon-300 via-coral-300 to-lavender-300 text-xl shadow-lg shadow-raspberry-200/30 sm:size-12 sm:rounded-3xl sm:text-2xl">
        ✨
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-base font-black tracking-tight text-ink sm:text-lg">{siteConfig.name}</span>
        <span className="block truncate text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink/55 sm:text-xs sm:tracking-[0.24em]">{siteConfig.owner}</span>
      </span>
    </Link>
  );
}
