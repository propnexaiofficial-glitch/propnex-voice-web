"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

import { AuthField } from "@/features/authentication/components/auth-field";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { AuthSocialButtons } from "@/features/authentication/components/auth-social-buttons";
import { AUTH_ROUTES } from "@/features/authentication/types";

export function SignUpPageContent() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      await axios.post(`${apiBase}/users/signup`, {
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
      });

      router.push(AUTH_ROUTES.signIn);
    } catch (err: any) {
      const responseData = err.response?.data;
      const errorMsg = responseData?.message 
        ? (Array.isArray(responseData.message) ? responseData.message.join(", ") : responseData.message)
        : (err.message || "Registration failed");
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Sign Up"
      welcomeTitle="Join PropNex AI"
      welcomeText="Create your account to access voice agents, campaigns, and analytics. Complete verification to activate your workspace."
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AuthField
            label="First name"
            name="firstName"
            type="text"
            placeholder="First name"
            autoComplete="given-name"
            disabled={submitting}
            required
          />
          <AuthField
            label="Last name"
            name="lastName"
            type="text"
            placeholder="Last name"
            autoComplete="family-name"
            disabled={submitting}
            required
          />
        </div>
        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          disabled={submitting}
          required
        />
        <AuthField
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="Phone number"
          autoComplete="tel"
          disabled={submitting}
          required
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          disabled={submitting}
          required
        />
        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          disabled={submitting}
          required
        />

        {error && (
          <p className="text-center text-xs text-red-400">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="auth-btn-primary mt-2 disabled:opacity-50">
          {submitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-5 space-y-4 text-center">
        <p className="text-xs text-white/45">Or</p>
        <AuthSocialButtons onGoogle={() => router.push(AUTH_ROUTES.dashboard)} />

        <p className="text-xs text-white/55">
          Already have an account?{" "}
          <Link href={AUTH_ROUTES.signIn} className="text-fuchsia-300 hover:text-fuchsia-200">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
