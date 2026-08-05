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

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    router.push(`${AUTH_ROUTES.verifyOtp}?purpose=password-reset`);
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    router.push(AUTH_ROUTES.signIn);
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
          />
          <AuthField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
          />

          {message && (
            <p className="text-center text-xs text-fuchsia-300">{message}</p>
          )}

          <button type="submit" className="auth-btn-primary">
            Update Password
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
        />

        {message && (
          <p className="text-center text-xs text-fuchsia-300">{message}</p>
        )}

        <button type="submit" className="auth-btn-primary">
          Send Reset OTP
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
