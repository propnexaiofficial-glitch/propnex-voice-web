"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      setMessage("Please enter the complete 6-digit OTP.");
      return;
    }
    
    if (purpose === "password-reset") {
      const email = localStorage.getItem("reset_email");
      if (!email) {
        setMessage("Session expired. Please restart the process.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/users/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.message || "Invalid OTP");
          return;
        }

        // Save OTP so we can send it on the next step
        localStorage.setItem("reset_otp", otp);
        router.push(copy.next);
      } catch (error) {
        setMessage("Failed to verify OTP.");
      } finally {
        setLoading(false);
      }
    } else {
      // Logic for email-verification if any
      router.push(copy.next);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;

    if (purpose === "password-reset") {
      const email = localStorage.getItem("reset_email");
      if (!email) {
        setMessage("Session expired.");
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch("/api/users/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, domainUrl: window.location.origin }),
        });
        
        if (res.ok) {
          setMessage("OTP resent. Please check your registered email.");
          setCooldown(60);
        } else {
          const data = await res.json();
          setMessage(data.message || "Failed to resend OTP.");
        }
      } catch (error) {
        setMessage("Failed to connect.");
      } finally {
        setLoading(false);
      }
    }
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

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="mt-5 space-y-3 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || loading}
          className={`text-xs transition ${cooldown > 0 ? "text-white/30 cursor-not-allowed" : "text-white/70 hover:text-white"}`}
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
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
