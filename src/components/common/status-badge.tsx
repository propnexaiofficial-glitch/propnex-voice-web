import { cva, type VariantProps } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva("", {
  variants: {
    status: {
      completed: "",
      missed: "",
      failed: "",
      active: "",
      pending: "",
      "in-progress": "",
    },
  },
  defaultVariants: {
    status: "pending",
  },
});

const statusConfig = {
  completed: { label: "Completed", variant: "success" as const },
  missed: { label: "Missed", variant: "warning" as const },
  failed: { label: "Failed", variant: "destructive" as const },
  active: { label: "Active", variant: "success" as const },
  pending: { label: "Pending", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
} satisfies Record<
  NonNullable<VariantProps<typeof statusBadgeVariants>["status"]>,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }
>;

type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  className?: string;
};

export function StatusBadge({ status = "pending", className }: StatusBadgeProps) {
  const config = statusConfig[status ?? "pending"];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
