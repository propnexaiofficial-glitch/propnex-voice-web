import type { CallRecord } from "@/types/call";

export type CampaignStatus = "idle" | "ready" | "running" | "completed" | "paused";

export type Campaign = {
  id: string;
  name: string;
  status: "idle" | "ready" | "running" | "paused" | "completed";
  totalContacts: number;
  uploadedFileName?: string;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  startedAt?: string;
  comingSoon?: boolean;
  leads?: any[];
  selectedDid?: string;
};

export type UploadCsvState = {
  fileName: string;
  contactCount: number;
  failedCalls?: number;
  leads?: any[];
  selectedDid?: string;
};
