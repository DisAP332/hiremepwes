import Link from "next/link";
import { SparkleLogo } from "@/components/SparkleLogo";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/72 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:px-6 lg:px-8">
        <SparkleLogo />
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring rounded-full px-4 py-2 text-sm font-bold text-ink/70 transition hover:bg-white hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/book" className="btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm">
          Request
        </Link>
      </div>
    </header>
  );
}
