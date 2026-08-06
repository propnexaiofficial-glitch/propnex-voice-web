import { Link } from "@/features/landing/lib/router";

const sizes = {
  nav: "text-lg md:text-xl",
  footer: "text-lg md:text-xl",
  lg: "text-xl md:text-2xl",
};

export default function Logo({ size = "nav", className = "", asLink = true }) {
  const textClass = className || sizes[size] || sizes.nav;

  const content = (
    <span className={`brand-logo-text font-bold tracking-tight ${textClass}`}>
      PropNex AI
    </span>
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
