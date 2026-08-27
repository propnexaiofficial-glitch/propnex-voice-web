"use client";

import { useCallback, useState, useEffect, useRef } from "react";

import {
  MOCK_CSV_CONTACT_COUNT,
  outboundCampaignInitial,
} from "@/features/outbound/data";
import type { Campaign, UploadCsvState } from "@/features/outbound/types";

export function useCampaign(initialState: Campaign = outboundCampaignInitial) {
  const [campaign, setCampaign] = useState<Campaign>(initialState);
  const [upload, setUpload] = useState<UploadCsvState | null>(null);
  const [alertData, setAlertData] = useState<{ title: string; description: string; isError?: boolean } | null>(null);
  const ignorePollingUntil = useRef<number>(0);
  const hasClearedFailedCalls = useRef<boolean>(false);

  const handleUpload = useCallback((fileName: string, leads: any[] = [], selectedDid?: string, channels: number = 1) => {
    setUpload({ fileName, contactCount: leads.length || MOCK_CSV_CONTACT_COUNT, leads });
    setCampaign((prev) => ({
      ...prev,
      id: `camp-${Date.now()}`, // Generate a unique ID so backend treats it as a fresh campaign!
      status: "ready",
      totalContacts: leads.length || MOCK_CSV_CONTACT_COUNT,
      uploadedFileName: fileName,
      completedCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      leads: leads,
      selectedDid: selectedDid,
      channels: channels
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

    // Reset the clear flag so we can track new failed calls
    hasClearedFailedCalls.current = false;

    // Ignore backend polling for 5 seconds to allow backend state to reset
    // This prevents the frontend from fetching the "previous" campaign's stats and showing them instantly
    ignorePollingUntil.current = Date.now() + 5000;

    try {
      const storedUserStr = localStorage.getItem("user");
      const user = storedUserStr ? JSON.parse(storedUserStr) : {};
      const companyId = user.companyId || null;

      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";
      const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

      // Ensure we have a DID number (it defaults to user's assigned numbers, but fallback to one if missing)
      const didNumber = campaign.selectedDid || (user.assignedNumbersDetailed && user.assignedNumbersDetailed[0]?.number) || "+917969007102";

      const res = await fetch(`${apiBase === '/api' ? '' : apiBase}/api/campaign-execution/start`, {
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
          channels: campaign.channels ?? 1
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
        
        // Prevent polling if we just started a campaign
        if (Date.now() < ignorePollingUntil.current) return;

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";
        const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

        const query = companyId ? `?companyId=${companyId}` : '';
        const res = await fetch(`${apiBase === '/api' ? '' : apiBase}/api/campaign-execution/status${query}`, {
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

              // Ignore stale backend state from previous campaigns
              if (data.campaignId && data.campaignId !== prev.id) {
                return prev;
              }
              
              return {
                ...prev,
                status: data.status || prev.status,
                completedCalls: data.completedCalls !== undefined ? Math.max(data.completedCalls, prev.completedCalls) : prev.completedCalls,
                successfulCalls: data.successfulCalls !== undefined ? Math.max(data.successfulCalls, prev.successfulCalls) : prev.successfulCalls,
                // If we explicitly cleared, force it to 0. Otherwise use Math.max to prevent backend load-balancer fluttering!
                failedCalls: (hasClearedFailedCalls.current || (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('cleared_campaigns') || '[]').includes(prev.id))) ? 0 : (data.failedCalls !== undefined ? Math.max(data.failedCalls, prev.failedCalls) : prev.failedCalls),
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

    // Poll every 1 second for highly responsive live updates
    interval = setInterval(pollCampaignStatus, 1000);
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

  const clearFailedCalls = useCallback(() => {
    hasClearedFailedCalls.current = true;
    
    // Save to localStorage so it persists across page navigations/remounts
    if (typeof window !== 'undefined') {
      try {
        const cleared = JSON.parse(localStorage.getItem('cleared_campaigns') || '[]');
        setCampaign(prev => {
          if (!cleared.includes(prev.id)) {
            cleared.push(prev.id);
            if (cleared.length > 50) cleared.shift(); // Keep only last 50 to prevent bloat
            localStorage.setItem('cleared_campaigns', JSON.stringify(cleared));
          }
          return {
            ...prev,
            failedCalls: 0,
            leads: prev.leads?.filter(l => !l.isFailed) || []
          };
        });
      } catch (e) {}
    } else {
      setCampaign(prev => ({
        ...prev,
        failedCalls: 0,
        leads: prev.leads?.filter(l => !l.isFailed) || []
      }));
    }
  }, []);

  const clearCampaign = useCallback(() => {
    setCampaign(prev => ({
      ...prev,
      status: "idle",
      leads: [],
      fileName: undefined,
      totalContacts: 0,
      completedCalls: 0,
      failedCalls: 0,
      successfulCalls: 0,
    }));
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
    clearFailedCalls,
    clearCampaign,
    alertData,
    setAlertData,
  };
}
