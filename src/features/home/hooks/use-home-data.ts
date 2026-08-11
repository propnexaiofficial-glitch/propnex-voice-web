import {
  creditsOverview,
  dashboardStats,
  quickActions,
} from "@/features/home/data";

export function useHomeData() {
  return {
    stats: dashboardStats,
    quickActions,
    credits: creditsOverview,
  };
}
