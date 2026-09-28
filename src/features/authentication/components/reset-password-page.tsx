"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthField } from "@/features/authentication/components/auth-field";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { AUTH_ROUTES } from "@/features/authentication/types";

type ResetStep = "email" | "new-password";

export function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = (searchParams.get("step") as ResetStep) ?? "email";
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          domainUrl: window.location.origin
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      // Save email to local storage so verify-otp can use it
      localStorage.setItem("reset_email", email);
      router.push(`${AUTH_ROUTES.verifyOtp}?purpose=password-reset`);
    } catch (error) {
      setMessage("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const email = localStorage.getItem("reset_email");
    const otp = localStorage.getItem("reset_otp");

    if (!email || !otp) {
      setMessage("Session expired. Please restart the process.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword,
          domainUrl: window.location.origin
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setMessage(data.message || "Failed to reset password.");
        return;
      }

      localStorage.removeItem("reset_email");
      localStorage.removeItem("reset_otp");
      
      router.push(AUTH_ROUTES.signIn + "?reset=success");
    } catch (error) {
      setMessage("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "new-password") {
    return (
      <AuthShell
        title="Reset Password"
        welcomeTitle="Set a new password"
        welcomeText="Your OTP has been verified. Enter a new password for your registered account."
      >
        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          <AuthField
            label="New password"
            name="newPassword"
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            required
            disabled={loading}
          />
          <AuthField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            disabled={loading}
          />

          {message && (
            <p className="text-center text-xs text-fuchsia-300">{message}</p>
          )}

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-white/55">
          <Link href={AUTH_ROUTES.signIn} className="text-fuchsia-300 hover:text-fuchsia-200">
            Back to Sign In
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset Password"
      welcomeTitle="Forgot password?"
      welcomeText="Enter your registered email address. We will send a password-reset OTP to verify your identity."
    >
      <form className="space-y-4" onSubmit={handleEmailSubmit}>
        <AuthField
          label="Registered email address"
          name="email"
          type="email"
          placeholder="Registered email address"
          autoComplete="email"
          required
          disabled={loading}
        />

        {message && (
          <p className="text-center text-xs text-fuchsia-300">{message}</p>
        )}

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? "Sending..." : "Send Reset OTP"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-white/55">
        Remember your password?{" "}
        <Link href={AUTH_ROUTES.signIn} className="text-fuchsia-300 hover:text-fuchsia-200">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
