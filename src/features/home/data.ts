import {
  CreditCard,
  Mic2,
  PhoneIncoming,
  PhoneOutgoing,
  Upload,
  Users,
  Zap,
} from "lucide-react";

import type {
  DashboardStat,
  QuickAction,
  RecentActivityItem,
} from "@/features/home/types";

export const dashboardStats: DashboardStat[] = [
  {
    id: "inbound-calls",
    title: "Inbound Calls",
    value: 1284,
    change: 12.4,
    changeLabel: "vs last month",
    icon: PhoneIncoming,
    accent: "purple",
  },
  {
    id: "outbound-calls",
    title: "Outbound Calls",
    value: 892,
    change: 8.2,
    changeLabel: "vs last month",
    icon: PhoneOutgoing,
    accent: "blue",
  },
  {
    id: "active-agents",
    title: "Active Agents",
    value: 6,
    change: 2,
    changeLabel: "new this week",
    icon: Mic2,
    accent: "green",
  },
  {
    id: "credits-used",
    title: "Credits Used",
    value: "3,240",
    change: -4.1,
    changeLabel: "vs last month",
    icon: Zap,
    accent: "gold",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "view-inbound",
    title: "View Inbound Logs",
    description: "Monitor incoming AI-handled calls and recordings",
    href: "/dashboard/inbound",
    icon: PhoneIncoming,
    accent: "purple",
  },
  {
    id: "start-campaign",
    title: "Start Campaign",
    description: "Upload CSV and launch an outbound calling campaign",
    href: "/dashboard/outbound",
    icon: Upload,
    accent: "blue",
  },
  {
    id: "browse-agents",
    title: "Browse Agent Library",
    description: "Preview voice samples and assign agents",
    href: "/dashboard/agent-library",
    icon: Mic2,
    accent: "green",
  },
  {
    id: "manage-team",
    title: "Manage Sub-Companies",
    description: "Onboard clients and track their usage",
    href: "/dashboard/employees",
    icon: Users,
    accent: "gold",
  },
  {
    id: "top-up-credits",
    title: "Top Up Credits",
    description: "Add credits and manage telephony channels",
    href: "/dashboard/billing",
    icon: CreditCard,
    accent: "purple",
  },
];


export const creditsOverview = {
  balance: 12450,
  usedThisMonth: 3240,
  monthlyLimit: 15000,
  usagePercent: 78,
};
