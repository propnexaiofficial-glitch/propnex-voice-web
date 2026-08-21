"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { AuthField } from "@/features/authentication/components/auth-field";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { AuthSocialButtons } from "@/features/authentication/components/auth-social-buttons";
import { AUTH_ROUTES } from "@/features/authentication/types";

export function SignUpPageContent() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState<string | undefined>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = (formData.get("email") as string).toLowerCase();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!isValidPhoneNumber(phone)) {
      newErrors.phone = "Please enter a valid phone number for this country";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`/api/users/signup`, {
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
      setErrors({ root: errorMsg });
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
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AuthField
            label="First name"
            name="firstName"
            type="text"
            placeholder="First name"
            autoComplete="given-name"
            disabled={submitting}
            error={errors.firstName}
            required
          />
          <AuthField
            label="Last name"
            name="lastName"
            type="text"
            placeholder="Last name"
            autoComplete="family-name"
            disabled={submitting}
            error={errors.lastName}
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
          error={errors.email}
          required
        />
        <div className="space-y-2 block">
          <label className="sr-only">Phone number</label>
          <PhoneInput
            international
            defaultCountry="IN"
            value={phone}
            onChange={setPhone}
            disabled={submitting}
            className={`auth-input flex items-center gap-2 [&>input]:bg-transparent [&>input]:outline-none [&>input]:text-white [&>input]:w-full ${errors.phone ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500" : ""}`}
          />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          disabled={submitting}
          error={errors.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div>
          <AuthField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            disabled={submitting}
            error={errors.confirmPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {password && confirmPassword && password === confirmPassword && (
            <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
          )}
        </div>

        {errors.root && (
          <p className="text-center text-xs text-red-400">{errors.root}</p>
        )}

        <button type="submit" disabled={submitting} className="auth-btn-primary mt-2 disabled:opacity-50">
          {submitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-5 space-y-4 text-center">
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
