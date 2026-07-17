"use client";

import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

type SocialLink = {
  label: string;
  href: string;
  Icon: IconType;
  className: string;
  glowClassName: string;
  style: CSSProperties;
};

const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/seranacleans",
    Icon: FaInstagram,
    className: "text-white",
    glowClassName: "bg-fuchsia-300/50",
    style: {
      background:
        "radial-gradient(circle at 30% 110%, #feda75 0%, #fa7e1e 24%, #d62976 48%, #962fbf 72%, #4f5bd5 100%)",
    },
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Serana-Cleans/61591619771069/",
    Icon: FaFacebookF,
    className: "bg-[#1877F2] text-white",
    glowClassName: "bg-blue-300/50",
    style: {},
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/serana-robinson-135205251/?isSelfProfile=true",
    Icon: FaLinkedinIn,
    className: "bg-[#0A66C2] text-white",
    glowClassName: "bg-sky-300/50",
    style: {},
  },
  {
    label: "Email",
    href: "mailto:serana.robins1998@gmail.com",
    Icon: MdEmail,
    className: "bg-white text-[#EA4335]",
    glowClassName: "bg-red-300/50",
    style: {},
  },
];

function animatedStyle(style: CSSProperties, index: number) {
  return {
    ...style,
    "--social-delay": `${index * 0.16}s`,
  } as CSSProperties;
}

export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/80 px-3 py-3 shadow-[0_-10px_30px_rgba(80,40,120,0.08)] backdrop-blur-xl sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 sm:gap-4">
        {socialLinks.map(
          ({ label, href, Icon, className, glowClassName, style }, index) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              title={label}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
              className={`social-icon group relative grid h-11 w-11 place-items-center rounded-2xl shadow-lg shadow-ink/10 transition duration-300 hover:-translate-y-1 hover:rotate-3 hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-lavender-300 sm:h-12 sm:w-12 ${className}`}
              style={animatedStyle(style, index)}
            >
              <span
                className={`absolute inset-0 -z-10 rounded-2xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 ${glowClassName}`}
              />
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            </a>
          ),
        )}

        <a
          href="https://foodsecurityflow.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Food Security Flow"
          title="A mutual-aid project I built"
          className="social-icon group relative grid h-11 min-w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-100 via-pink-100 to-rose-200 px-3 text-xl shadow-lg shadow-ink/10 transition duration-300 hover:-translate-y-1 hover:rotate-3 hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-lavender-300 sm:h-12 sm:text-2xl"
          style={animatedStyle({}, socialLinks.length)}
        >
          <span className="absolute inset-0 -z-10 rounded-2xl bg-orange-300/50 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
          <span aria-hidden>🍑</span>
          <span className="sr-only">Food Security Flow</span>
        </a>
      </div>

      <style>{`
        .social-icon {
          animation: social-footer-float 4.8s ease-in-out infinite;
          animation-delay: var(--social-delay);
        }

        .social-icon:hover svg,
        .social-icon:hover > span[aria-hidden] {
          animation: social-footer-wiggle 0.55s ease-in-out both;
        }

        @keyframes social-footer-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1.5deg);
          }
        }

        @keyframes social-footer-wiggle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-10deg) scale(1.08);
          }
          50% {
            transform: rotate(10deg) scale(1.1);
          }
          75% {
            transform: rotate(-5deg) scale(1.06);
          }
        }
      `}</style>
    </footer>
  );
}
