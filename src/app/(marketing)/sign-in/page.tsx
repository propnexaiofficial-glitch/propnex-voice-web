import { redirect } from "next/navigation";

export default function MarketingSignInRedirect() {
  redirect("/auth/sign-in");
}
