import Image from "next/image";
import { Link } from "@/features/landing/lib/router";

const sizes = {
  nav: "h-8 w-auto",
  footer: "h-7 w-auto",
  lg: "h-9 w-auto",
};

export default function Logo({ size = "nav", className = "", asLink = true }) {
  const imageClass = `${sizes[size] || sizes.nav} object-contain ${className}`.trim();

  const content = (
    <Image
      src="/propnex-logo-cropped.png"
      alt="PropNex AI"
      width={140}
      height={36}
      className={imageClass}
      priority
    />
  );

  if (!asLink) return content;

  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center"
      aria-label="PropNex AI home"
    >
      {content}
    </Link>
  );
}
