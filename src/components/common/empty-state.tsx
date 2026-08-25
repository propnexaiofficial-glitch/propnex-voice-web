import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({
  title = "No data yet",
  description = "Content will appear here once available.",
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Inbox className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-[260px] text-sm text-muted-foreground">
        {description}
      </p>
      {children}
    </div>
  );
}
