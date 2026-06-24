"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="border-t border-white/70 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-xl font-black text-ink">✨ {siteConfig.name}</p>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Local help from {siteConfig.owner}: cleaning, tech help, AI privacy, and handmade masks.
          </p>
        </div>
        <div>
          <p className="font-black text-ink">Area</p>
          <p className="mt-2 text-sm text-ink/65">{siteConfig.serviceArea}</p>
          <p className="mt-1 text-sm text-ink/65">{siteConfig.includedRadius}. {siteConfig.extraTravel}</p>
        </div>
        <div>
          <p className="font-black text-ink">Contact</p>
          <div className="mt-2 space-y-1 text-sm text-ink/65">
            <p>Email: <a className="font-bold text-ink underline decoration-raspberry-200 decoration-2 underline-offset-4" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
            {siteConfig.phone ? <p>Phone: <a className="font-bold text-ink" href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a></p> : null}
            <p><Link className="font-bold text-ink underline decoration-aqua-300 decoration-2 underline-offset-4" href="/privacy">Privacy note</Link></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
