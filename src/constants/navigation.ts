import {
  Home,
  PhoneIncoming,
  PhoneOutgoing,
  Mic2,
  Users,
  CreditCard,
  Wrench,
} from "lucide-react";

import type { NavItem } from "@/types/navigation";

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
    description: "Profile info & credits overview",
  },
  {
    title: "Inbound",
    href: "/dashboard/inbound",
    icon: PhoneIncoming,
    description: "Incoming call logs",
  },
  {
    title: "Outbound",
    href: "/dashboard/outbound",
    icon: PhoneOutgoing,
    description: "Outgoing calls & campaigns",
  },
  {
    title: "Agent Library",
    href: "/dashboard/agent-library",
    icon: Mic2,
    description: "Voice agent samples",
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    description: "Sub-company management",
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    description: "Credits & telephony",
  },
  {
    title: "Agent Tools",
    href: "/dashboard/agent-tools",
    icon: Wrench,
    description: "Specialized sub-agents",
  },
];

export const APP_NAME = "PropNex AI";
export const APP_TAGLINE = "Voice AI Dashboard";
