import type { ServiceCategory } from "@/lib/validators";

export const siteConfig = {
  name: "HireMePwes",
  domain: "hiremepwes.com",
  owner: "Serana Robins",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "serana.robins1998@gmail.com",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  serviceArea: "Cincinnati and surrounding areas",
  includedRadius: "Within about 10 miles",
  extraTravel: "Extra travel may include a small fee, confirmed before scheduling.",
};

export type ServiceCard = {
  category: ServiceCategory;
  title: string;
  shortTitle: string;
  emoji: string;
  tagline: string;
  description: string;
  includes: string[];
  storySteps: string[];
  questPrompt: string;
  startingAt: string;
  accent: string;
};

export const serviceCards: ServiceCard[] = [
  {
    category: "cleaning_reset",
    title: "Cleaning & Reset Service",
    shortTitle: "Cleaning Reset",
    emoji: "🫧",
    tagline: "A fresh start for your space.",
    questPrompt: "Tell me what needs cleaned or reset.",
    description:
      "Kitchen, bathroom, floors, surfaces, trash, light organization, and focused home resets. Photos help with estimates but are optional.",
    includes: ["Standard cleans", "Deep resets", "Kitchen/bath focus", "Light organizing", "Pet-aware cleaning"],
    storySteps: ["Pick the area", "Share the details", "Serana confirms before scheduling"],
    startingAt: "$100 minimum / $30 per hour",
    accent: "from-coral-300 to-lemon-300",
  },
  {
    category: "pc_phone_repair",
    title: "PC & Phone Repair Help",
    shortTitle: "PC / Phone Repair",
    emoji: "💻",
    tagline: "Help with phones, computers, and setup.",
    questPrompt: "Tell me what the device is doing.",
    description:
      "Computer cleanup, basic troubleshooting, phone setup, software help, peripheral setup, slow device checks, and practical repair guidance.",
    includes: ["Slow PC cleanup", "Phone setup", "Wi‑Fi/device help", "Basic diagnosis", "Upgrade guidance"],
    storySteps: ["Name the device", "Describe the issue", "Confirm a help session"],
    startingAt: "$100 minimum / $30 per hour",
    accent: "from-aqua-300 to-sky-300",
  },
  {
    category: "ai_data_protection",
    title: "AI Data Protection Service",
    shortTitle: "AI Data Protection",
    emoji: "🔮",
    tagline: "A privacy checkup for AI tools and accounts.",
    questPrompt: "Tell me what you want to protect.",
    description:
      "A practical privacy checkup for AI app settings, account permissions, file metadata, scam risk, safer sharing habits, and cleanup checklists.",
    includes: ["AI privacy settings", "Account permission review", "Metadata basics", "Scam-risk check", "Safer sharing plan"],
    storySteps: ["Choose the concern", "Share the tools involved", "Get a practical checklist"],
    startingAt: "$100 minimum / $30 per hour",
    accent: "from-lavender-300 to-fuchsia-300",
  },
  {
    category: "masks_crafts",
    title: "Masks & Handmade Crafts",
    shortTitle: "Masks & Crafts",
    emoji: "🎭",
    tagline: "Custom masks, gifts, and art pieces.",
    questPrompt: "Tell me the piece you have in mind.",
    description:
      "Handmade masks and craft pieces for custom colors, decorative pieces, costume looks, gifts, and small commissions.",
    includes: ["Custom masks", "Decorative pieces", "Color matching", "Gift ideas", "Commission requests"],
    storySteps: ["Describe the idea", "Share colors and timing", "Serana sends a quote"],
    startingAt: "Quoted per project",
    accent: "from-raspberry-300 to-lavender-300",
  },
];

export const pricing = [
  {
    name: "Minimum Visit",
    price: "$100",
    detail: "Best for small resets, initial troubleshooting, or focused help.",
    bullets: ["Covers the first visit minimum", "Clear scope before starting", "Good for same-week requests"],
  },
  {
    name: "Flexible Hourly",
    price: "$30/hr",
    detail: "Use this when the job is hard to predict or mixed between services.",
    bullets: ["Cleaning, tech, organizing, or AI privacy help", "You approve the plan first", "Simple and transparent"],
  },
  {
    name: "Custom Quote",
    price: "By request",
    detail: "For deep resets, craft commissions, larger homes, or multi-step tech projects.",
    bullets: ["Photos help but are optional", "Travel fee may apply", "No surprise booking without confirmation"],
  },
];

export const simplePath = [
  {
    title: "Choose a service",
    body: "Pick one service card. No giant explanation first.",
    emoji: "🃏",
  },
  {
    title: "Share the clues",
    body: "The form only asks questions that match that service.",
    emoji: "🕯️",
  },
  {
    title: "Serana confirms",
    body: "Your request is reviewed before anything goes on the calendar.",
    emoji: "📅",
  },
];

export const faqs = [
  {
    question: "Do I need to make an account?",
    answer: "No. Just send a request form. Serana reviews it and confirms, declines, or suggests a different time.",
  },
  {
    question: "Why do you ask for a social profile?",
    answer:
      "For basic safety verification before going to a home or accepting an in-person appointment. Facebook, Instagram, LinkedIn, or another public profile works.",
  },
  {
    question: "Do you bring cleaning supplies?",
    answer:
      "Serana can bring basics, but supplies offered by the customer are appreciated. The request form asks what you already have available.",
  },
  {
    question: "Do I need to upload photos?",
    answer:
      "Photos are appreciated because they help estimate time, but they are not required. No shame if you would rather describe the situation instead.",
  },
  {
    question: "Can I request help this week?",
    answer: "Yes. Same-week requests are welcome when scheduling works out.",
  },
  {
    question: "What does AI Data Protection mean?",
    answer:
      "It is a practical privacy and safety checkup for AI tools, accounts, files, device habits, permissions, metadata awareness, and safer sharing practices. It is not a guarantee against every cyber risk.",
  },
];
