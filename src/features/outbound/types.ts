import type { CallRecord } from "@/types/call";

export type CampaignStatus = "idle" | "ready" | "running" | "completed" | "paused" | "scheduled";

export type Campaign = {
  id: string;
  name: string;
  status: "idle" | "ready" | "running" | "paused" | "completed" | "scheduled";
  totalContacts: number;
  uploadedFileName?: string;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  startedAt?: string;
  scheduledAt?: string;
  comingSoon?: boolean;
  leads?: any[];
  selectedDid?: string;
  channels?: number;
};

export type UploadCsvState = {
  fileName: string;
  contactCount: number;
  failedCalls?: number;
  leads?: any[];
  selectedDid?: string;
};
