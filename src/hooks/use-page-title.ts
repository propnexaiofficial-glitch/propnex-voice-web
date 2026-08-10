"use client";

import { usePathname } from "next/navigation";

import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { useEmployeesContext } from "@/features/employees/context/employees-context";

export function usePageTitle() {
  const pathname = usePathname();
  const { getCompanyById } = useEmployeesContext();

  const companyMatch = pathname.match(/^\/dashboard\/employees\/([^/]+)/);
  if (companyMatch) {
    const company = getCompanyById(companyMatch[1]);
    if (company) {
      return company.name;
    }
  }

  const match = MAIN_NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match?.title ?? "Dashboard";
}
