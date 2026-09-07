"use client";

import CareersApplyPage from "@/features/landing/pages/CareersApplyPage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  return <CareersApplyPage jobId={id} />;
}
