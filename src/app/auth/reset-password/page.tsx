import { Suspense } from "react";

import { ResetPasswordPageContent } from "@/features/authentication/components/reset-password-page";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-page min-h-screen bg-black" />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
