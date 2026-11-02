import { Metadata } from "next";
import AIAutomationPage from "@/features/landing/pages/AIAutomationPage";

export const metadata: Metadata = {
  title: "AI Automation & Clinical Decision Support - PropNex AI",
  description: "Explore enterprise AI Automation systems by PropNex AI, featuring Smile Clinic — HIPAA-compliant real-time Clinical Decision Support (CDS) & prescription safety technology.",
};

export default function Page() {
  return <AIAutomationPage />;
}
