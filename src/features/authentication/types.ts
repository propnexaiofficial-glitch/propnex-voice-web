export type AuthField = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
};

export type OtpPurpose = "email-verification" | "password-reset" | "login-verification" | "signup-verification";

export const AUTH_ROUTES = {
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  verifyEmail: "/auth/verify-email",
  verifyOtp: "/auth/verify-otp",
  resetPassword: "/auth/reset-password",
  forgotPassword: "/auth/forgot-password",
  dashboard: "/dashboard",
} as const;
