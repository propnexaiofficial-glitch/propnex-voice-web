"use client";

import { useCallback, useState, useEffect } from "react";

import {
  MOCK_CSV_CONTACT_COUNT,
  outboundCampaignInitial,
} from "@/features/outbound/data";
import type { Campaign, UploadCsvState } from "@/features/outbound/types";

export function useCampaign(initialState: Campaign = outboundCampaignInitial) {
  const [campaign, setCampaign] = useState<Campaign>(initialState);
  const [upload, setUpload] = useState<UploadCsvState | null>(null);
  const [alertData, setAlertData] = useState<{ title: string; description: string; isError?: boolean } | null>(null);

  const handleUpload = useCallback((fileName: string, leads: any[] = [], selectedDid?: string) => {
    setUpload({ fileName, contactCount: leads.length || MOCK_CSV_CONTACT_COUNT, leads });
    setCampaign((prev) => ({
      ...prev,
      status: "ready",
      totalContacts: leads.length || MOCK_CSV_CONTACT_COUNT,
      uploadedFileName: fileName,
      completedCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      leads: leads,
      selectedDid: selectedDid
    }));
  }, []);

  const startCampaign = useCallback(async () => {
    if (campaign.status !== "ready" || !campaign.leads || campaign.leads.length === 0) return;
    
    // Deduplicate leads to match backend constraints and prevent double-calling
    const uniqueLeads = Array.from(
      new Map(campaign.leads.map(lead => [lead.phone, lead])).values()
    );
    
    setCampaign((prev) => ({
      ...prev,
      leads: uniqueLeads,
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
      const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

      // Ensure we have a DID number (it defaults to user's assigned numbers, but fallback to one if missing)
      const didNumber = campaign.selectedDid || (user.assignedNumbersDetailed && user.assignedNumbersDetailed[0]?.number) || "+917935215682";

      const res = await fetch(`${adminBase}/api/campaign-execution/start`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${pnxToken}`
        },
        body: JSON.stringify({
          companyId,
          campaignId: campaign.id,
          didNumber,
          leads: uniqueLeads,
          channels: didNumber.includes("079") ? 4 : 2
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to start campaign");
      }

      // Campaign successfully queued. The useEffect will handle state updates.
    } catch (error: any) {
      console.error("Failed to start campaign:", error);
      // Revert status on failure
      setCampaign((prev) => ({
        ...prev,
        status: "ready",
      }));
      setAlertData({
        title: "Campaign Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        isError: true,
      });
    }
  }, [campaign.id, campaign.status, campaign.leads, campaign.selectedDid]);

  // Polling useEffect to keep the UI in sync with backend Redis state
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollCampaignStatus = async () => {
      try {
        const storedUserStr = localStorage.getItem("user");
        const user = storedUserStr ? JSON.parse(storedUserStr) : {};
        const companyId = user.companyId || null;

        if (!companyId) return;

        const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.propnexai.com";
        const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

        const res = await fetch(`${adminBase}/api/campaign-execution/status`, {
          headers: { Authorization: `Bearer ${pnxToken}` }
        });

        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            setCampaign(prev => {
              // Only alert if we transition to completed newly
              if (prev.status === "running" && data.status === "completed") {
                setAlertData({
                  title: "Campaign Completed",
                  description: `All ${data.leads?.length || 0} leads have been processed.`,
                });
              }
              
              return {
                ...prev,
                status: data.status,
                completedCalls: data.completedCalls,
                successfulCalls: data.successfulCalls,
                failedCalls: data.failedCalls,
                leads: data.leads || prev.leads,
                totalContacts: data.totalContacts || prev.totalContacts,
              };
            });
          }
        }
      } catch (err) {
        console.error("Failed to poll backend campaign status:", err);
      }
    };

    // Poll every 3 seconds
    interval = setInterval(pollCampaignStatus, 3000);
    pollCampaignStatus(); // Initial check on mount!

    return () => clearInterval(interval);
  }, []);

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

  const deleteLead = useCallback((index: number) => {
    setCampaign((prev) => {
      if (!prev.leads) return prev;
      const newLeads = prev.leads.filter((_, i) => i !== index);
      // Update total contacts count if a lead is deleted
      return { 
        ...prev, 
        leads: newLeads,
        totalContacts: prev.totalContacts > 0 ? prev.totalContacts - 1 : 0
      };
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
    deleteLead,
    alertData,
    setAlertData,
  };
}
