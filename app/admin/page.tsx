import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminProtectedArea } from "@/components/AdminProtectedArea";
import { AdminSchedulePanel } from "@/components/AdminSchedulePanel";

export const metadata: Metadata = {
  title: "Admin | HireMePwes",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <AdminProtectedArea>
      <AdminDashboard />
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <AdminSchedulePanel />
      </div>
    </AdminProtectedArea>
  );
}
