import Image from "next/image";

import { useBrand } from "@/components/providers/brand-provider";
import { BRAND_LOGO } from "@/constants/brand";
import { Link } from "@/features/landing/lib/router";

const sizeClasses = {
  nav: "max-h-10 sm:max-h-11 md:max-h-12",
  footer: "max-h-10 md:max-h-11",
  lg: "max-h-12 md:max-h-14",
};

export default function Logo({ size = "nav", className = "", asLink = true }) {
  const brand = useBrand();
  const imageClass = className || sizeClasses[size] || sizeClasses.nav;

  const content = (
    <img
      src={brand.logoUrl || BRAND_LOGO.src}
      alt={brand.companyName || BRAND_LOGO.alt}
      width={BRAND_LOGO.width}
      height={BRAND_LOGO.height}
      className={`h-auto w-auto max-w-full object-contain object-left ${imageClass}`}
    />
  );

  if (!asLink) return content;

  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
      aria-label={`${brand.companyName || 'PropNex AI'} home`}
    >
      {content}
    </Link>
  );
}
