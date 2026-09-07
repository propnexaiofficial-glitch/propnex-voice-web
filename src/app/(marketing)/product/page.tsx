import { Metadata } from "next";
import ProductPage from "@/features/landing/pages/ProductPage";

export const metadata: Metadata = {
  title: "Products & Services - PropNex AI",
  description: "Explore the full spectrum of AI Automation including Voice AI, Chatbots, custom CRMs, and Business Process Automation.",
};

export default function Page() {
  return <ProductPage />;
}
