import {
  creditsOverview,
  dashboardStats,
  quickActions,
  recentActivity,
} from "@/features/home/data";

export function useHomeData() {
  return {
    stats: dashboardStats,
    quickActions,
    recentActivity,
    credits: creditsOverview,
  };
}
