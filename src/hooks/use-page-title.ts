"use client";

import { usePathname } from "next/navigation";

import { MAIN_NAV_ITEMS } from "@/constants/navigation";

export function usePageTitle() {
  const pathname = usePathname();
  const match = MAIN_NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  return match?.title ?? "Dashboard";
}
