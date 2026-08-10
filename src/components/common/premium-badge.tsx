"use client";

import { Crown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type PremiumBadgeProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const iconSizes = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
};

export function PremiumBadge({
  label = "Premium",
  size = "md",
  className,
  showIcon = true,
}: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        "premium-badge inline-flex items-center rounded-md font-medium uppercase tracking-wide",
        sizeStyles[size],
        className
      )}
    >
      {showIcon && <Crown className={cn(iconSizes[size], "shrink-0")} />}
      {label}
    </span>
  );
}

type PremiumHighlightProps = {
  children: React.ReactNode;
  className?: string;
};

export function PremiumHighlight({ children, className }: PremiumHighlightProps) {
  return (
    <span className={cn("premium-text-shimmer font-medium", className)}>
      {children}
    </span>
  );
}

type PremiumLabelProps = {
  text: string;
  className?: string;
};

export function PremiumLabel({ text, className }: PremiumLabelProps) {
  const parts = text.split(/(premium)/gi);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === "premium" ? (
          <PremiumHighlight key={i}>{part}</PremiumHighlight>
        ) : (
          part
        )
      )}
    </span>
  );
}

type PremiumChipProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PremiumChip({ icon, children, className }: PremiumChipProps) {
  return (
    <div
      className={cn(
        "premium-chip inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium",
        className
      )}
    >
      {icon ?? <Sparkles className="size-3.5 text-muted-foreground" />}
      {children}
    </div>
  );
}
