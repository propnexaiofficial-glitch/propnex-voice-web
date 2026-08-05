"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/features/authentication/components/auth-shell";
import { OtpInput } from "@/features/authentication/components/otp-input";
import { AUTH_ROUTES, type OtpPurpose } from "@/features/authentication/types";

const purposeCopy: Record<OtpPurpose, { title: string; text: string; next: string }> = {
  "email-verification": {
    title: "Verify OTP",
    text: "Enter the OTP to complete email verification.",
    next: AUTH_ROUTES.dashboard,
  },
  "password-reset": {
    title: "Verify OTP",
    text: "Enter the password-reset OTP sent to your registered email.",
    next: `${AUTH_ROUTES.resetPassword}?step=new-password`,
  },
};

export function VerifyOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purpose = (searchParams.get("purpose") as OtpPurpose) ?? "email-verification";
  const copy = purposeCopy[purpose] ?? purposeCopy["email-verification"];

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      setMessage("Please enter the complete 6-digit OTP.");
      return;
    }
    setMessage("");
    router.push(copy.next);
  }

  function handleResend() {
    setMessage("OTP resent. Please check your registered email.");
  }

  return (
    <AuthShell
      title={copy.title}
      welcomeTitle="Verify OTP"
      welcomeText="OTP verification is required for email verification and password reset. Codes expire after a limited time."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <p className="text-center text-xs leading-relaxed text-white/60">{copy.text}</p>

        <OtpInput value={otp} onChange={setOtp} />

        {message && (
          <p className="text-center text-xs text-fuchsia-300">{message}</p>
        )}

        <button type="submit" className="auth-btn-primary">
          Verify OTP
        </button>
      </form>

      <div className="mt-5 space-y-3 text-center">
        <button
          type="button"
          onClick={handleResend}
          className="text-xs text-white/70 transition hover:text-white"
        >
          Resend OTP
        </button>
        <p className="text-xs text-white/55">
          <Link href={AUTH_ROUTES.signIn} className="text-fuchsia-300 hover:text-fuchsia-200">
            Back to Sign In
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
