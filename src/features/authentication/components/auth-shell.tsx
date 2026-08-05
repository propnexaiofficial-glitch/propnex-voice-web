"use client";

import Link from "next/link";

import { AUTH_ROUTES } from "@/features/authentication/types";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  welcomeTitle?: string;
  welcomeText?: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  welcomeTitle = "Welcome Back !",
  welcomeText = "Thrilled to have you. Explore seamlessly. Your return enhance our digital space. Thank you for choosing us again!",
  children,
  className,
}: AuthShellProps) {
  return (
    <div className={cn("auth-page", className)}>
      <div
        className="auth-orb auth-orb-purple"
        style={{ width: 420, height: 420, top: "-8%", right: "18%" }}
      />
      <div
        className="auth-orb auth-orb-green"
        style={{ width: 380, height: 380, bottom: "-10%", left: "-6%" }}
      />
      <div
        className="auth-orb auth-orb-magenta"
        style={{ width: 260, height: 260, bottom: "8%", right: "6%" }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="flex justify-end lg:hidden">
          <Link href={AUTH_ROUTES.dashboard} className="auth-btn-skip">
            Skip Now
          </Link>
        </div>

        <div className="hidden max-w-md space-y-6 lg:block">
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            {welcomeTitle}
          </h1>
          <p className="text-sm leading-relaxed text-white/75">{welcomeText}</p>
          <Link href={AUTH_ROUTES.dashboard} className="auth-btn-skip inline-block">
            Skip Now
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="auth-form-box rounded-sm bg-black/40 px-8 py-10 backdrop-blur-sm">
            <h2 className="mb-8 text-center text-2xl font-semibold">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
