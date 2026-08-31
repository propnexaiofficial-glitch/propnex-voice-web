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
    icon: PhoneIncoming,
    accent: "purple",
  },
  {
    id: "outbound-calls",
    title: "Outbound Calls",
    value: 892,
    icon: PhoneOutgoing,
    accent: "blue",
  },
  {
    id: "total-agents",
    title: "Total Agents",
    value: 6,
    icon: Mic2,
    accent: "green",
  },
  {
    id: "credits-used",
    title: "Credits Used",
    value: "3,240",
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
    id: "agent-library",
    title: "Agent Library",
    description: "Browse and assign AI agents to your campaigns",
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
