import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { serviceCards, siteConfig } from "@/data/site";

const serviceLine: Record<string, string> = {
  cleaning_reset: "Home resets and cleaning",
  pc_phone_repair: "Device setup and repair help",
  ai_data_protection: "Privacy checkups for AI tools",
  masks_crafts: "Masks and handmade pieces",
};
