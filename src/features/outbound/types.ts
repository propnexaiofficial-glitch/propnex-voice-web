import type { CallRecord } from "@/types/call";

export type CampaignStatus = "idle" | "ready" | "running" | "completed" | "paused";

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  totalContacts: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  uploadedFileName?: string;
  startedAt?: string;
  comingSoon?: boolean;
};

export type UploadCsvState = {
  fileName: string;
  contactCount: number;
};
