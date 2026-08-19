"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
  isLockedOut?: boolean;
};

export function SidebarNav({ onNavigate, className, isLockedOut }: SidebarNavProps) {
  const pathname = usePathname();

  const activeHref = MAIN_NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <TooltipProvider delayDuration={0}>
      <nav className={cn("flex flex-col gap-1 px-3", className)}>
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = item.href === activeHref;
          const Icon = item.icon;
          const isBilling = item.href === "/dashboard/billing";
          const isComingSoon = item.comingSoon;
          const isDisabled = (isLockedOut && !isBilling) || isComingSoon;

          const LinkContent = (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  return;
                }
                onNavigate?.();
              }}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive && !isComingSoon
                  ? "sidebar-active-indicator bg-accent text-foreground"
                  : isDisabled
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {isActive && !isComingSoon && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-lg transition-all",
                  isActive && !isComingSoon
                    ? "bg-foreground text-background"
                    : isDisabled
                    ? "bg-muted/30 text-muted-foreground/30"
                    : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="relative z-10 truncate">{item.title}</span>
            </Link>
          );

          if (isComingSoon) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <div>
                    {LinkContent}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Coming Soon</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return LinkContent;
        })}
      </nav>
    </TooltipProvider>
  );
}

function SidebarLogout({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 justify-center items-center border-t border-border px-4 py-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 px-2.5 text-md text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link href="/auth/sign-in">
          <LogOut className="size-3.5" />
          Log out
        </Link>
      </Button>
    </div>
  );
}

type SidebarProps = {
  className?: string;
  isLockedOut?: boolean;
};

export function Sidebar({ className, isLockedOut }: SidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 flex-col border-r border-border bg-sidebar-background lg:flex",
        className
      )}
    >
      <div className="flex h-[var(--header-height)] shrink-0 items-center border-b border-border bg-sidebar-background px-5">
        <Logo />
      </div>

      <ScrollArea className="min-h-0 flex-1 py-4">
        <SidebarNav isLockedOut={isLockedOut} />
      </ScrollArea>

      <SidebarLogout />
    </aside>
  );
}

export { SidebarLogout };
