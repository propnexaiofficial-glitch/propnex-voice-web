import { redirect } from "next/navigation";

export default function MarketingSignUpRedirect() {
  redirect("/auth/sign-up");
}
