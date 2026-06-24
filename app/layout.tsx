import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { siteConfig } from "@/data/site";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${siteConfig.name} | Serana's Cleaning, Tech, AI Privacy & Crafts`,
  description:
    "Bright local help from Serana in Cincinnati and surrounding areas: cleaning resets, PC/phone help, AI data protection checkups, and handmade masks/crafts.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hiremepwes.com"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <div className="bubble-field" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, index) => (
                <span
                  key={index}
                  className="bubble"
                  style={{
                    left: `${(index * 7) % 100}%`,
                    width: `${1.8 + (index % 5) * 0.9}rem`,
                    height: `${1.8 + (index % 5) * 0.9}rem`,
                    animationDuration: `${12 + (index % 6) * 3}s`,
                    animationDelay: `${index * 0.9}s`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <SiteNav />
              {children}
              <Footer />
            </div>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
