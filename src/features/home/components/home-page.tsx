"use client";

import { CreditsOverviewCard } from "@/features/home/components/credits-overview-card";
import { DashboardSummary } from "@/features/home/components/dashboard-summary";
import { ProfileCard } from "@/features/home/components/profile-card";
import { QuickActions } from "@/features/home/components/quick-actions";
import { RecentActivity } from "@/features/home/components/recent-activity";

export function HomePageContent() {
  return (
    <div className="space-y-8">
      <DashboardSummary />

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileCard className="lg:col-span-2" />
        <CreditsOverviewCard />
      </div>

      <QuickActions />
    </div>
  );
}
