"use client";

import { useCallback, useState } from "react";

import {
  initialCampaign,
  MOCK_CSV_CONTACT_COUNT,
} from "@/features/outbound/data";
import type { Campaign, UploadCsvState } from "@/features/outbound/types";

export function useCampaign() {
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign);
  const [upload, setUpload] = useState<UploadCsvState | null>(null);

  const handleUpload = useCallback((fileName: string) => {
    setUpload({ fileName, contactCount: MOCK_CSV_CONTACT_COUNT });
    setCampaign((prev) => ({
      ...prev,
      status: "ready",
      totalContacts: MOCK_CSV_CONTACT_COUNT,
      uploadedFileName: fileName,
      completedCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
    }));
  }, []);

  const startCampaign = useCallback(() => {
    if (campaign.status !== "ready") return;
    setCampaign((prev) => ({
      ...prev,
      status: "running",
      startedAt: new Date().toISOString(),
      completedCalls: Math.floor(prev.totalContacts * 0.35),
      successfulCalls: Math.floor(prev.totalContacts * 0.28),
      failedCalls: Math.floor(prev.totalContacts * 0.07),
    }));
  }, [campaign.status]);

  const pauseCampaign = useCallback(() => {
    setCampaign((prev) =>
      prev.status === "running" ? { ...prev, status: "paused" } : prev
    );
  }, []);

  const resumeCampaign = useCallback(() => {
    setCampaign((prev) =>
      prev.status === "paused" ? { ...prev, status: "running" } : prev
    );
  }, []);

  const progressPercent =
    campaign.totalContacts > 0
      ? Math.round((campaign.completedCalls / campaign.totalContacts) * 100)
      : 0;

  return {
    campaign,
    upload,
    progressPercent,
    handleUpload,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
  };
}
