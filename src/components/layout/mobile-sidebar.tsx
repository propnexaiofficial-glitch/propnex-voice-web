"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { SidebarLogout, SidebarNav } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileSidebar({ isLockedOut }: { isLockedOut?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[var(--sidebar-width)] flex-col gap-0 bg-sidebar-background p-0"
      >
        <div className="flex h-[var(--header-height)] shrink-0 items-center border-b border-border px-5">
          <Logo compact />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          <SidebarNav onNavigate={() => setOpen(false)} isLockedOut={isLockedOut} />
        </div>
        <SidebarLogout />
      </SheetContent>
    </Sheet>
  );
}
