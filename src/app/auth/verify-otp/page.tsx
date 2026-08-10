import { Suspense } from "react";

import { VerifyOtpPageContent } from "@/features/authentication/components/verify-otp-page";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="auth-page min-h-screen bg-black" />}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}
