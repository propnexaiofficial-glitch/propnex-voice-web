"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Pencil, Mail, CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/features/authentication/components/auth-shell";
import { OtpInput } from "@/features/authentication/components/otp-input";
import { AUTH_ROUTES, type OtpPurpose } from "@/features/authentication/types";

const purposeCopy: Record<OtpPurpose, { title: string; heading: string; subtext: string; editRoute: string; emailKey: string; next: string }> = {
  "email-verification": {
    title: "Verify Email",
    heading: "Check your email",
    subtext: "We sent a 6-digit verification code to",
    editRoute: AUTH_ROUTES.signIn,
    emailKey: "login_email",
    next: AUTH_ROUTES.dashboard,
  },
  "password-reset": {
    title: "Reset Password",
    heading: "Check your email",
    subtext: "We sent a 6-digit password reset code to",
    editRoute: AUTH_ROUTES.forgotPassword,
    emailKey: "reset_email",
    next: `${AUTH_ROUTES.resetPassword}?step=new-password`,
  },
  "login-verification": {
    title: "Verify Login",
    heading: "Check your email",
    subtext: "We sent a 6-digit login code to",
    editRoute: AUTH_ROUTES.signIn,
    emailKey: "login_email",
    next: AUTH_ROUTES.dashboard,
  },
  "signup-verification": {
    title: "Verify Account",
    heading: "Check your email",
    subtext: "We sent a 6-digit activation code to",
    editRoute: AUTH_ROUTES.signUp,
    emailKey: "signup_email",
    next: AUTH_ROUTES.signIn,
  },
};

export function VerifyOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purpose = (searchParams.get("purpose") as OtpPurpose) ?? "email-verification";
  const copy = purposeCopy[purpose] ?? purposeCopy["email-verification"];

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // Load email from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(copy.emailKey) || "";
    setEmail(stored);
  }, [copy.emailKey]);

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
      if (!email) { setMessage("Session expired. Please restart the process."); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/users/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (!res.ok) { setMessage(data.message || "Invalid OTP"); return; }
        localStorage.setItem("reset_otp", otp);
        router.push(copy.next);
      } catch { setMessage("Failed to verify OTP."); }
      finally { setLoading(false); }

    } else if (purpose === "login-verification") {
      if (!email) { setMessage("Session expired."); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/users/signin-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (!res.ok) { setMessage(data.message || "Invalid OTP"); return; }

        const rememberMe = localStorage.getItem("login_remember_me");
        if (rememberMe === "true") {
          // Store trust as { email, trustedAt } so server can verify it was granted AFTER any force-logout
          let trusted: { email: string; trustedAt: string }[] = [];
          try { trusted = JSON.parse(localStorage.getItem("trusted_devices") || "[]"); } catch {}
          trusted = trusted.filter(t => t.email !== email); // remove old entry for this email
          trusted.push({ email, trustedAt: new Date().toISOString() });
          localStorage.setItem("trusted_devices", JSON.stringify(trusted));
          // Keep legacy trusted_emails for backward compat
          let trustedEmails: string[] = [];
          try { trustedEmails = JSON.parse(localStorage.getItem("trusted_emails") || "[]"); } catch {}
          if (!trustedEmails.includes(email)) trustedEmails.push(email);
          localStorage.setItem("trusted_emails", JSON.stringify(trustedEmails));
        }
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push(copy.next);
      } catch { setMessage("Failed to verify login OTP."); }
      finally { setLoading(false); }

    } else if (purpose === "signup-verification") {
      if (!email) { setMessage("Session expired."); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/users/signup-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, domainUrl: window.location.origin }),
        });
        const data = await res.json();
        if (!res.ok) { setMessage(data.message || "Invalid OTP"); return; }
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Account verified! Redirecting...");
        setTimeout(() => router.push(copy.next), 300);
      } catch { setMessage("Failed to verify signup OTP."); }
      finally { setLoading(false); }
    } else {
      router.push(copy.next);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    if (purpose === "password-reset") {
      if (!email) { setMessage("Session expired."); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/users/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, domainUrl: window.location.origin }),
        });
        if (res.ok) { setMessage(`OTP resent to ${email}`); setCooldown(60); }
        else { const d = await res.json(); setMessage(d.message || "Failed to resend OTP."); }
      } catch { setMessage("Failed to connect."); }
      finally { setLoading(false); }
    } else if (purpose === "login-verification" || purpose === "signup-verification") {
      if (!email) { setMessage("Session expired."); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/users/resend-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, purpose, domainUrl: window.location.origin }),
        });
        if (res.ok) { setMessage(`OTP resent to ${email}`); setCooldown(60); }
        else { const d = await res.json(); setMessage(d.message || "Failed to resend OTP."); }
      } catch { setMessage("Failed to connect."); }
      finally { setLoading(false); }
    }
  }

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(b.length - 1, 2)) + c)
    : "";

  return (
    <AuthShell
      title={copy.title}
      welcomeTitle="Verify OTP"
      welcomeText="OTP verification is required for email verification and password reset. Codes expire after 10 minutes."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>

        {/* Email sent-to block */}
        <div className="space-y-2 text-center">
          {/* Mail icon */}
          <div className="flex justify-center mb-3">
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(217,70,239,0.1)",
              border: "1px solid rgba(217,70,239,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Mail size={22} style={{ color: "rgb(217,70,239)" }} />
            </div>
          </div>

          <h3 className="text-white font-semibold text-base">{copy.heading}</h3>
          <p className="text-xs text-white/55 leading-relaxed">{copy.subtext}</p>

          {/* Email pill with edit button */}
          {email && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 14px",
                borderRadius: "9999px",
                border: "1px solid rgba(217,70,239,0.35)",
                background: "rgba(217,70,239,0.08)",
              }}>
                <CheckCircle2 size={13} style={{ color: "rgb(52,211,153)", flexShrink: 0 }} />
                <span className="text-sm font-semibold text-white/90 tracking-wide">{maskedEmail}</span>
              </div>
              <button
                type="button"
                title="Edit email address"
                onClick={() => router.push(copy.editRoute)}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,70,239,0.15)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(217,70,239,0.4)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                <Pencil size={12} style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            </div>
          )}

          <p className="text-[11px] text-white/35 mt-1">
            Didn&apos;t get it? Check spam or resend below.
          </p>
        </div>

        <OtpInput value={otp} onChange={setOtp} />

        {message && (
          <p className={`text-center text-xs ${message.includes("resent") || message.includes("verified") ? "text-emerald-400" : "text-red-400"}`}>
            {message}
          </p>
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
          className={`text-xs transition ${cooldown > 0 ? "text-white/30 cursor-not-allowed" : "text-fuchsia-300 hover:text-fuchsia-200 hover:underline"}`}
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
