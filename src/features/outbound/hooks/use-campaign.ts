"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import {
  MOCK_CSV_CONTACT_COUNT,
  outboundCampaignInitial,
} from "@/features/outbound/data";
import type { Campaign, UploadCsvState } from "@/features/outbound/types";

export function useCampaign(initialState: Campaign = outboundCampaignInitial) {
  const [campaign, setCampaign] = useState<Campaign>(initialState);
  const [upload, setUpload] = useState<UploadCsvState | null>(null);
  const [alertData, setAlertData] = useState<{ title: string; description: string; isError?: boolean } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
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
      channels: channels,
      isReactivation: false // Ensure new uploads are treated as normal outbound campaigns
    }));
  }, []);

  const startCampaign = useCallback(async () => {
    if (campaign.status !== "ready" || !campaign.leads || campaign.leads.length === 0) return;
    
    // Deduplicate leads to match backend constraints and prevent double-calling
    const uniqueLeads = Array.from(
      new Map(campaign.leads.map(lead => {
        const corePhone = lead.phone.replace(/\D/g, "").slice(-10);
        return [corePhone, lead];
      })).values()
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
          channels: campaign.channels ?? 1,
          uploadedFileName: campaign.uploadedFileName,
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

  // WebSocket connection to keep UI in sync with backend Redis state instantly
  useEffect(() => {
    let socket: Socket;
    let initialFetchDone = false;

    const connectWebSocket = async () => {
      try {
        const storedUserStr = localStorage.getItem("user");
        const user = storedUserStr ? JSON.parse(storedUserStr) : {};
        const companyId = user.companyId || null;

        if (!companyId) {
          setIsInitializing(false);
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";
        const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

        // First, fetch initial state via HTTP
        const query = `?companyId=${companyId}`;
        const res = await fetch(`${apiBase === '/api' ? '' : apiBase}/api/campaign-execution/status${query}`, {
          headers: { Authorization: `Bearer ${pnxToken}` }
        });

        if (res.ok) {
          const { data } = await res.json();
          handleStateUpdate(data);
        }
        
        initialFetchDone = true;

        // Then connect via WebSocket
        socket = io(apiBase, {
          query: { companyId },
          transports: ['websocket', 'polling'],
          withCredentials: true,
        });

        socket.on('campaign-updated', (data) => {
          handleStateUpdate(data);
        });
      } catch (err) {
        console.error("Failed to connect to backend campaign socket:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    const handleStateUpdate = (data: any) => {
      if (!data) return;
      setCampaign(prev => {
        // Only alert if we transition to completed newly
        if (prev.status === "running" && data.status === "completed") {
          setAlertData({
            title: "Campaign Completed",
            description: `All ${data.leads?.length || 0} leads have been processed.`,
          });
        }

        // Require campaignId to adopt any backend state
        if (!data.campaignId) return prev;

        // Adopt backend state if we are currently idle and backend has an active or recent campaign
        if (data.campaignId !== prev.id) {
          if (prev.status === "idle" && data.status !== "idle" && data.status !== "force_stopped") {
            return {
              ...prev,
              id: data.campaignId,
              status: data.status,
              completedCalls: data.completedCalls || 0,
              successfulCalls: data.successfulCalls || 0,
              failedCalls: data.failedCalls || 0,
              leads: data.leads || [],
              totalContacts: data.totalContacts || 0,
              isReactivation: !!data.isReactivation,
              scheduledAt: data.scheduledAt || prev.scheduledAt,
              uploadedFileName: data.uploadedFileName || prev.uploadedFileName,
            };
          }
          // Otherwise ignore stale backend state from previous campaigns
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
          isReactivation: data.isReactivation !== undefined ? !!data.isReactivation : prev.isReactivation,
          scheduledAt: data.scheduledAt || prev.scheduledAt,
          uploadedFileName: data.uploadedFileName || prev.uploadedFileName,
        };
      });
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Fallback HTTP polling in case WebSocket events are missed (e.g. dropped connection)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (campaign.status === "running") {
      interval = setInterval(async () => {
        if (Date.now() < ignorePollingUntil.current) return;
        
        try {
          const storedUserStr = localStorage.getItem("user");
          const user = storedUserStr ? JSON.parse(storedUserStr) : {};
          const companyId = user.companyId || null;
          if (!companyId) return;

          const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";
          const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";
          
          const res = await fetch(`${apiBase === '/api' ? '' : apiBase}/api/campaign-execution/status?companyId=${companyId}`, {
            headers: { Authorization: `Bearer ${pnxToken}` }
          });

          if (res.ok) {
            const { data } = await res.json();
            if (data) {
              setCampaign(prev => {
                if (!data.campaignId) return prev;
                // Only process if the campaign ID matches (we don't want to adopt stale states here)
                if (data.campaignId !== prev.id) return prev;
                
                // Alert logic
                if (prev.status === "running" && data.status === "completed") {
                  setAlertData({
                    title: "Campaign Completed",
                    description: `All ${data.leads?.length || 0} leads have been processed.`,
                  });
                }
                
                return {
                  ...prev,
                  status: data.status || prev.status,
                  completedCalls: data.completedCalls !== undefined ? Math.max(data.completedCalls, prev.completedCalls) : prev.completedCalls,
                  successfulCalls: data.successfulCalls !== undefined ? Math.max(data.successfulCalls, prev.successfulCalls) : prev.successfulCalls,
                  failedCalls: (hasClearedFailedCalls.current || (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('cleared_campaigns') || '[]').includes(prev.id))) ? 0 : (data.failedCalls !== undefined ? Math.max(data.failedCalls, prev.failedCalls) : prev.failedCalls),
                  leads: data.leads || prev.leads,
                  totalContacts: data.totalContacts || prev.totalContacts,
                  isReactivation: data.isReactivation !== undefined ? !!data.isReactivation : prev.isReactivation,
                  scheduledAt: data.scheduledAt || prev.scheduledAt,
                  uploadedFileName: data.uploadedFileName || prev.uploadedFileName,
                };
              });
            }
          }
        } catch (e) {
          console.error("Fallback polling failed", e);
        }
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
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

  const clearCampaign = useCallback(async () => {
    try {
      const storedUserStr = localStorage.getItem("user");
      const user = storedUserStr ? JSON.parse(storedUserStr) : {};
      const companyId = user.companyId || null;

      if (companyId) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";
        const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

        await fetch(`${apiBase === '/api' ? '' : apiBase}/api/campaign-execution/clear`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${pnxToken}`
          },
          body: JSON.stringify({ companyId })
        });
      }
    } catch (err) {
      console.error("Failed to clear campaign state on backend", err);
    }

    setCampaign(prev => ({
      ...prev,
      id: "main-idle",
      status: "idle",
      leads: [],
      fileName: undefined,
      uploadedFileName: undefined,
      totalContacts: 0,
      completedCalls: 0,
      failedCalls: 0,
      successfulCalls: 0,
    }));
  }, []);

  const forceStopCampaign = useCallback(async () => {
    try {
      const storedUserStr = localStorage.getItem("user");
      const user = storedUserStr ? JSON.parse(storedUserStr) : {};
      const companyId = user.companyId || null;

      if (companyId) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";
        const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

        await fetch(`${apiBase === '/api' ? '' : apiBase}/api/campaign-execution/force-stop`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${pnxToken}`
          },
          body: JSON.stringify({ companyId })
        });
        
        // Let the websocket handle the actual state update to force_stopped
        // But we can eagerly update it locally too
        setCampaign(prev => ({ ...prev, status: "force_stopped" }));
        
        const processed = campaign.completedCalls || 0;
        const successful = campaign.successfulCalls || 0;
        const failed = campaign.failedCalls || 0;
        
        setAlertData({
          title: "Campaign Force Stopped",
          description: `Processed: ${processed} • Successful: ${successful} • Failed: ${failed}`,
          isError: false,
        });
      }
    } catch (err) {
      console.error("Failed to force stop campaign on backend", err);
    }
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
    forceStopCampaign,
    alertData,
    setAlertData,
    isInitializing,
  };
}
