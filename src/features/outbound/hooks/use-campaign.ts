"use client";

import { useCallback, useState } from "react";

import {
  MOCK_CSV_CONTACT_COUNT,
  outboundCampaignInitial,
} from "@/features/outbound/data";
import type { Campaign, UploadCsvState } from "@/features/outbound/types";

export function useCampaign(initialState: Campaign = outboundCampaignInitial) {
  const [campaign, setCampaign] = useState<Campaign>(initialState);
  const [upload, setUpload] = useState<UploadCsvState | null>(null);

  const handleUpload = useCallback((fileName: string, leads: any[] = []) => {
    setUpload({ fileName, contactCount: leads.length || MOCK_CSV_CONTACT_COUNT, leads });
    setCampaign((prev) => ({
      ...prev,
      status: "ready",
      totalContacts: leads.length || MOCK_CSV_CONTACT_COUNT,
      uploadedFileName: fileName,
      completedCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      leads: leads
    }));
  }, []);

  const startCampaign = useCallback(async () => {
    if (campaign.status !== "ready" || !campaign.leads || campaign.leads.length === 0) return;
    
    setCampaign((prev) => ({
      ...prev,
      status: "running",
      startedAt: new Date().toISOString(),
      completedCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
    }));

    try {
      const storedUserStr = localStorage.getItem("user");
      const user = storedUserStr ? JSON.parse(storedUserStr) : {};
      const companyId = user.companyId || null;

      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.propnexai.com";
      const res = await fetch(`${adminBase}/api/outbound/start-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          leads: campaign.leads,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to start campaign");
      }

      // Success
    } catch (error) {
      console.error("Failed to start campaign:", error);
      // Revert status on failure
      setCampaign((prev) => ({
        ...prev,
        status: "ready",
      }));
      alert(`Failed to start campaign: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [campaign.status, campaign.leads]);

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

  const editLead = useCallback((index: number, updatedLead: any) => {
    setCampaign((prev) => {
      if (!prev.leads) return prev;
      const newLeads = [...prev.leads];
      newLeads[index] = updatedLead;
      return { ...prev, leads: newLeads };
    });
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
    editLead,
  };
}
