"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/features/authentication/components/auth-shell";
import { OtpInput } from "@/features/authentication/components/otp-input";
import { AUTH_ROUTES } from "@/features/authentication/types";

export function VerifyEmailPageContent() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      setMessage("Please enter the 6-digit OTP sent to your email.");
      return;
    }
    setMessage("");
    router.push(AUTH_ROUTES.dashboard);
  }

  function handleResend() {
    setMessage("A new verification OTP has been sent to your registered email.");
  }

  return (
    <AuthShell
      title="Verify Email"
      welcomeTitle="Almost there!"
      welcomeText="We sent a verification OTP to your registered email address. Enter it below to activate your account."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <p className="text-center text-xs leading-relaxed text-white/60">
          Enter the 6-digit OTP sent to your registered email address.
        </p>

        <OtpInput value={otp} onChange={setOtp} />

        {message && (
          <p className="text-center text-xs text-fuchsia-300">{message}</p>
        )}

        <button type="submit" className="auth-btn-primary">
          Verify Email
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
          Wrong email?{" "}
          <Link href={AUTH_ROUTES.signUp} className="text-fuchsia-300 hover:text-fuchsia-200">
            Go back to Sign Up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
