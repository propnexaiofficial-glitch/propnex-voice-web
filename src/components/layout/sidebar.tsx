"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  const activeHref = MAIN_NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className={cn("flex flex-col gap-1 px-3", className)}>
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive = item.href === activeHref;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "sidebar-active-indicator bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-lg transition-all",
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="relative z-10 truncate">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-full w-[var(--sidebar-width)] shrink-0 flex-col border-r border-border bg-sidebar-background lg:flex",
        className
      )}
    >
      <div className="flex h-[var(--header-height)] items-center border-b border-border px-5">
        <Logo />
      </div>

      <ScrollArea className="flex-1 py-4">
        <SidebarNav />
      </ScrollArea>

      <div className="border-t border-border p-4">
        <Button variant="ghost" className="w-full justify-start gap-3 px-3" asChild>
          <Link href="/auth/sign-in">
            <LogOut className="size-4" />
            Log out
          </Link>
        </Button>
      </div>
    </aside>
  );
}
