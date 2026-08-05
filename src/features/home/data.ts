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
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "start-campaign",
    title: "Start Campaign",
    description: "Upload CSV and launch an outbound calling campaign",
    href: "/dashboard/outbound",
    icon: Upload,
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "browse-agents",
    title: "Browse Agent Library",
    description: "Preview voice samples and assign agents",
    href: "/dashboard/agent-library",
    icon: Mic2,
    accent: "green",
    image: "/quick-actions/agent-library.jpg",
  },
  {
    id: "manage-team",
    title: "Manage Sub-Companies",
    description: "Onboard clients and track their usage",
    href: "/dashboard/employees",
    icon: Users,
    accent: "gold",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "top-up-credits",
    title: "Top Up Credits",
    description: "Add credits and manage telephony channels",
    href: "/dashboard/billing",
    icon: CreditCard,
    accent: "purple",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
  },
];

export const recentActivity: RecentActivityItem[] = [
  {
    id: "1",
    title: "Inbound call completed",
    description: "+65 9123 4567 · 4m 32s · 12 credits",
    timestamp: "2m ago",
    type: "inbound",
  },
  {
    id: "2",
    title: "Outbound campaign started",
    description: "Lead Reactivation · 150 contacts queued",
    timestamp: "18m ago",
    type: "outbound",
  },
  {
    id: "3",
    title: "Voice agent assigned",
    description: "Sarah · Professional · English (US)",
    timestamp: "1h ago",
    type: "agent",
  },
  {
    id: "4",
    title: "Credits topped up",
    description: "+5,000 credits added to balance",
    timestamp: "3h ago",
    type: "billing",
  },
];

export const creditsOverview = {
  balance: 12450,
  usedThisMonth: 3240,
  monthlyLimit: 15000,
  usagePercent: 78,
};
