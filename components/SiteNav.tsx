import Link from "next/link";
import { CalendarDays } from "lucide-react";

const navItems = [
  { href: "/schedule", label: "My Schedule" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/72 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Serana Cleans home" className="group flex min-w-0 items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/70 bg-white/70 text-lg shadow-lg shadow-pink-200/40 transition group-hover:scale-105 sm:h-12 sm:w-12">✨</span>
          <span className="serana-rainbow-logo text-[1.05rem] font-black uppercase tracking-[0.12em] sm:text-2xl">Serana Cleans</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === "/schedule"
                ? "focus-ring inline-flex items-center rounded-full bg-gradient-to-r from-lemon-100 to-aqua-100 px-4 py-2 text-sm font-black text-ink shadow-sm transition hover:-translate-y-0.5"
                : "focus-ring rounded-full px-4 py-2 text-sm font-bold text-ink/70 transition hover:bg-white hover:text-ink"}
            >
              {item.href === "/schedule" ? <CalendarDays className="mr-1.5 size-4 text-raspberry-300" /> : null}
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://foodsecurityflow.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Food Security Flow"
          title="A mutual-aid project I built"
          className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-orange-100 via-pink-100 to-rose-200 px-3 py-2 text-xs font-black text-ink shadow-md shadow-orange-200/30 transition hover:-translate-y-0.5 hover:scale-105 sm:px-4 sm:text-sm"
        >
          <span className="text-base transition group-hover:rotate-6 group-hover:scale-110" aria-hidden>🍑</span>
          <span className="hidden sm:inline">Food Security Flow</span>
        </a>
      </div>

      <style>{`
        .serana-rainbow-logo {
          background: linear-gradient(90deg, #ff4fd8, #ff9f1c, #fff275, #48ff91, #4ddcff, #a78bfa, #ff4fd8);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 10px rgba(255,79,216,.35), 0 0 18px rgba(77,220,255,.25), 0 0 28px rgba(167,139,250,.25);
          animation: serana-rainbow-shift 5s ease-in-out infinite;
          white-space: nowrap;
        }
        @keyframes serana-rainbow-shift {
          0%,100% { background-position: 0% 50%; filter: drop-shadow(0 0 4px rgba(255,79,216,.35)); }
          50% { background-position: 100% 50%; filter: drop-shadow(0 0 9px rgba(77,220,255,.45)); }
        }
      `}</style>
    </header>
  );
}
