"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

import { AuthField } from "@/features/authentication/components/auth-field";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { AuthSocialButtons } from "@/features/authentication/components/auth-social-buttons";
import { AUTH_ROUTES } from "@/features/authentication/types";

export function SignInPageContent() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const response = await axios.post(`${apiBase}/users/signin`, {
        email,
        password,
      });

      const data = response.data;

      // Store tokens and user profile
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push(AUTH_ROUTES.dashboard);
    } catch (err: any) {
      const responseData = err.response?.data;
      const errorMsg = responseData?.message 
        ? (Array.isArray(responseData.message) ? responseData.message.join(", ") : responseData.message)
        : (err.message || "Invalid email or password");
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Login">
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          disabled={submitting}
          required
        />

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-white/60 accent-fuchsia-500"
            disabled={submitting}
          />
          Remember me
        </label>

        {error && (
          <p className="text-center text-xs text-red-400">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="auth-btn-primary disabled:opacity-50">
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-5 space-y-4 text-center">
        <Link
          href={AUTH_ROUTES.resetPassword}
          className="text-xs text-white/70 transition hover:text-white"
        >
          Forget Password?
        </Link>

        <p className="text-xs text-white/45">Or</p>

        <AuthSocialButtons onGoogle={() => router.push(AUTH_ROUTES.dashboard)} />

        <p className="text-xs text-white/55">
          New here?{" "}
          <Link href={AUTH_ROUTES.signUp} className="text-fuchsia-300 hover:text-fuchsia-200">
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
