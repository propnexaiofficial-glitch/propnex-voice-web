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
  const [alertData, setAlertData] = useState<{ title: string; description: string; isError?: boolean } | null>(null);

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

      const responseData = await res.json();
      const didNumber = responseData.didNumber;
      const channels = responseData.channels || 2; // Default to 2 if not provided

      if (!didNumber) {
        throw new Error("Failed to retrieve DID number from Vercel");
      }

      // Step 2: Authenticate directly with Voicelink from the browser (Option 1 Bypass)
      const VOICELINK_API_URL = "https://app.voicelink.co.in/api";
      const loginRes = await fetch(`${VOICELINK_API_URL}/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: "propnex",
          password: "PropnexAi2025@#",
        }),
      });

      if (!loginRes.ok) {
        throw new Error("Failed to authenticate with Voicelink from frontend");
      }

      const loginData = await loginRes.json();
      const token = loginData.data?.access_token || loginData.access_token;

      if (!token) {
        throw new Error("Invalid authentication response from Voicelink");
      }

      // Step 3: Loop through leads using concurrency and polling
      let activeCalls = new Map<string, number>();
      let activeCallCount = 0;
      let completedCount = 0;
      let currentIndex = 0;
      const pnxToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";

      const markAsFailed = async (phone: string, assignedNumber: string) => {
        try {
          await fetch(`/api/calls/outbound`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${pnxToken}`
            },
            body: JSON.stringify({ action: "fail", phone, assignedNumber })
          });
        } catch (e) {
          console.error("Failed to mark call as failed in DB", e);
        }
      };

      // We will loop until all leads are started AND activeCalls is empty
      while (currentIndex < campaign.leads.length || activeCallCount > 0) {
        
        // Check if we can start more calls based on channel limits
        while (activeCallCount < channels && currentIndex < campaign.leads.length) {
          const lead = campaign.leads[currentIndex];
          currentIndex++;
          
          try {
            const res = await fetch(`${VOICELINK_API_URL}/v1/add_lead`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                did_number: didNumber,
                customer_number: lead.phone.replace(/\D/g, "").slice(-10),
                country_code: "91",
                custom_parameters: JSON.stringify({ name: lead.name, companyId }),
              }),
            });
            
            if (!res.ok) {
              const errText = await res.text();
              console.error(`Failed to push lead ${lead.phone} to Voicelink:`, errText);
              await markAsFailed(lead.phone, didNumber);
            } else {
              activeCalls.set(lead.phone, (activeCalls.get(lead.phone) || 0) + 1);
              activeCallCount++;
            }
          } catch (err: any) {
            console.error(`Failed to push lead ${lead.phone}:`, err.message);
            await markAsFailed(lead.phone, didNumber);
          }
        }
        
        // Polling loop: Wait 3 seconds, then check status of active calls
        if (activeCallCount > 0) {
           await new Promise(resolve => setTimeout(resolve, 3000));
           
           try {
             // Fetch latest outbound calls for this company
             const pollRes = await fetch(`/api/calls/outbound?limit=50&companyId=${companyId}`, {
               headers: { Authorization: `Bearer ${pnxToken}` }
             });
             
             if (pollRes.ok) {
               const pollData = await pollRes.json();
               const dbCalls = pollData.data || [];
               
               // For each active call phone number, check how many are still pending/ringing in DB
               for (const [phone, count] of Array.from(activeCalls.entries())) {
                 const corePhone = phone.replace(/\D/g, "").slice(-10);
                 const matchingCalls = dbCalls.filter((c: any) => c.customerNumber?.includes(corePhone));
                 
                 const activeMatching = matchingCalls.filter((c: any) => ["pending", "ringing", "answered"].includes(c.status));
                 
                 if (activeMatching.length < count) {
                   const finishedCount = count - activeMatching.length;
                   if (activeMatching.length === 0) {
                     activeCalls.delete(phone);
                   } else {
                     activeCalls.set(phone, activeMatching.length);
                   }
                   activeCallCount -= finishedCount;
                   completedCount += finishedCount;
                   setCampaign(prev => ({ ...prev, completedCalls: completedCount }));
                 }
               }
             }
           } catch (pollErr) {
             console.error("Failed to poll call status", pollErr);
           }
        }
      }

      // Success
      setCampaign((prev) => ({
        ...prev,
        status: "completed",
        completedCalls: campaign.leads?.length || 0,
      }));
      setAlertData({
        title: "Campaign Completed",
        description: `All ${campaign.leads?.length || 0} leads have been processed.`,
      });
      
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
    alertData,
    setAlertData,
  };
}
