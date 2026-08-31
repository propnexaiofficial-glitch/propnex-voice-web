import { Suspense } from "react";
import { OutboundPageContent } from "@/features/outbound";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OutboundPage() {
  return <OutboundPageContent />;
}
