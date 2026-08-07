"use client";

import { useState, useEffect } from "react";
import { CreditsWidget } from "@/components/common/credits-widget";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NotificationButton } from "@/components/common/notification-button";
import { SearchBar } from "@/components/common/search-bar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserMenu } from "@/components/common/user-menu";
import { mockUser } from "@/data/mock-user";
import { cn } from "@/lib/utils";

type DashboardHeaderProps = {
  title?: string;
  className?: string;
};

export function DashboardHeader({
  title = "Dashboard",
  className,
}: DashboardHeaderProps) {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.firstName) {
          setFirstName(user.firstName);
          return;
        }
      } catch (e) {}
    }
    setFirstName(mockUser.name.split(" ")[0]);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[var(--header-height)] shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6",
        className
      )}
    >
      <MobileSidebar />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-0.5">
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Welcome back, {firstName}! 👋
          </p>
        </div>
      </div>

      <div className="hidden flex-1 justify-center lg:flex">
        <SearchBar />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <CreditsWidget variant="header" />
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  );
}
