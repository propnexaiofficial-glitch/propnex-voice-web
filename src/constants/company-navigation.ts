import {
  LayoutDashboard,
  PhoneIncoming,
  PhoneOutgoing,
  type LucideIcon,
} from "lucide-react";

export type CompanyNavItem = {
  title: string;
  segment: "overview" | "inbound" | "outbound";
  icon: LucideIcon;
  description: string;
};

export const COMPANY_NAV_ITEMS: CompanyNavItem[] = [
  {
    title: "Overview",
    segment: "overview",
    icon: LayoutDashboard,
    description: "Company profile and usage stats",
  },
  {
    title: "Inbound",
    segment: "inbound",
    icon: PhoneIncoming,
    description: "Incoming call logs for this client",
  },
  {
    title: "Outbound",
    segment: "outbound",
    icon: PhoneOutgoing,
    description: "Outgoing call logs for this client",
  },
];

export function companyNavHref(companyId: string, segment: CompanyNavItem["segment"]) {
  return `/dashboard/employees/${companyId}/${segment}`;
}
