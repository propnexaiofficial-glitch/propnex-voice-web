"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NotificationButtonProps = {
  count?: number;
  className?: string;
};

export function NotificationButton({
  count = 3,
  className,
}: NotificationButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label="Notifications"
    >
      <Bell className="size-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-0.5 -top-0.5 size-5 justify-center rounded-full p-0 text-[10px]"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  );
}
