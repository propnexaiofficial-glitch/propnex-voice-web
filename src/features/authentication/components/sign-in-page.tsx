"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

import { AuthField } from "@/features/authentication/components/auth-field";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { AuthSocialButtons } from "@/features/authentication/components/auth-social-buttons";
import { AUTH_ROUTES } from "@/features/authentication/types";

export function SignInPageContent() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [emailValue, setEmailValue] = useState("");
  const [trustedEmails, setTrustedEmails] = useState<string[]>([]);

  // Load trusted emails on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("trusted_emails") || "[]");
      setTrustedEmails(stored);
    } catch (e) {}
  }, []);

  const isCurrentEmailTrusted = trustedEmails.includes(emailValue.toLowerCase());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).toLowerCase();
    const password = formData.get("password") as string;

    const newErrors: Record<string, string> = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      const isTrusted = isCurrentEmailTrusted;

      // Get the timestamp when this device was trusted (from trusted_devices)
      let trustedAt: string | null = null;
      if (isTrusted) {
        try {
          const devices: { email: string; trustedAt: string }[] = JSON.parse(localStorage.getItem("trusted_devices") || "[]");
          const device = devices.find(d => d.email === email.toLowerCase());
          trustedAt = device?.trustedAt || null;
        } catch {}
      }

      const response = await axios.post(`/api/users/signin`, {
        email,
        password,
        trusted: isTrusted,
        trustedAt,   // ISO timestamp — server verifies this is AFTER any force-logout
        domainUrl: window.location.origin,
      });

      const data = response.data;

      if (data.requireOtp) {
        localStorage.setItem("login_email", email);
        if (rememberMe) {
          localStorage.setItem("login_remember_me", "true");
        } else {
          localStorage.removeItem("login_remember_me");
        }
        router.push(`${AUTH_ROUTES.verifyOtp}?purpose=login-verification`);
        return;
      }

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
      setErrors({ root: errorMsg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Login">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          disabled={submitting}
          required
          value={emailValue}
          onChange={(e: any) => setEmailValue(e.target.value)}
          error={errors.email}
        />

        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          disabled={submitting}
          error={errors.password}
          required
        />

        {!isCurrentEmailTrusted && (
          <div className="flex flex-col gap-1">
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
            <span className="text-[10px] text-white/40 ml-6">
              Save this device to skip OTP verification for future logins.
            </span>
          </div>
        )}

        {isCurrentEmailTrusted && (
          <div className="flex items-center gap-2 text-sm text-fuchsia-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Device remembered for this email
          </div>
        )}

        {errors.root && (
          <p className="text-center text-xs text-red-400">{errors.root}</p>
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
