import type { Metadata } from "next";
import { ScheduleExperience } from "@/components/ScheduleExperience";

export const metadata: Metadata = {
  title: "My Schedule | HireMePwes",
  description:
    "View Serana's availability and request a three-hour cleaning, tech, AI-help, or craft session.",
};

export default function SchedulePage() {
  return <ScheduleExperience />;
}
