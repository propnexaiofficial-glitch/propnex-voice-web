import type { CallRecord } from "@/types/call";

export type CampaignStatus = "idle" | "ready" | "running" | "completed" | "paused" | "scheduled";

export type Campaign = {
  id: string;
  name: string;
  status: "idle" | "ready" | "running" | "paused" | "completed" | "scheduled" | "force_stopped";
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
  isReactivation?: boolean;
  qStage?: "Q1" | "Q2" | "Q3";
  qStatus?: "Pending" | "Running" | "Completed";
  q1ScheduledAt?: string;
  q2ScheduledAt?: string;
  q3ScheduledAt?: string;
};

export type UploadCsvState = {
  fileName: string;
  contactCount: number;
  failedCalls?: number;
  leads?: any[];
  selectedDid?: string;
};
