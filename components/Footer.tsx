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
          ({ label, href, Icon, className, glowClassName, style },