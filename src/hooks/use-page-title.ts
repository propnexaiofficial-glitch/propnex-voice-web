"use client";

import { usePathname } from "next/navigation";

import { MAIN_NAV_ITEMS } from "@/constants/navigation";

export function usePageTitle() {
  const pathname = usePathname();
  const match = MAIN_NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match?.title ?? "Dashboard";
}
