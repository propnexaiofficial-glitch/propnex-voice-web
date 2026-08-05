import type { LucideIcon } from "lucide-react";

export type DashboardStat = {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  accent: "purple" | "blue" | "green" | "gold";
};

export type QuickAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "purple" | "blue" | "green" | "gold";
  image: string;
};

export type RecentActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "inbound" | "outbound" | "agent" | "billing";
};
