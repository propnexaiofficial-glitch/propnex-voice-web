"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthField } from "@/features/authentication/components/auth-field";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { AuthSocialButtons } from "@/features/authentication/components/auth-social-buttons";
import { AUTH_ROUTES } from "@/features/authentication/types";

export function SignUpPageContent() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(AUTH_ROUTES.verifyEmail);
  }

  return (
    <AuthShell
      title="Sign Up"
      welcomeTitle="Join PropNex AI"
      welcomeText="Create your account to access voice agents, campaigns, and analytics. Complete verification to activate your workspace."
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <AuthField
          label="Full name"
          name="name"
          type="text"
          placeholder="Full name"
          autoComplete="name"
          required
        />
        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
        />
        <AuthField
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="Phone number"
          autoComplete="tel"
          required
        />
        <AuthField
          label="Company"
          name="company"
          type="text"
          placeholder="Company"
          autoComplete="organization"
          required
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          required
        />
        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          required
        />

        <button type="submit" className="auth-btn-primary mt-2">
          Create Account
        </button>
      </form>

      <div className="mt-5 space-y-4 text-center">
        <p className="text-xs text-white/45">Or</p>
        <AuthSocialButtons onGoogle={() => router.push(AUTH_ROUTES.verifyEmail)} />

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
