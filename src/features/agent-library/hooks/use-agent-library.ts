"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type AgentEntry = {
  id: string;
  slug: string;
  name: string;
  profile: string;
  category: string;
  tone: string;
  language: string;
  voice: string;
  bestFor: string;
  useCases: string[];
  defaultType: string;
  estimatedSetupMinutes: number;
  samplePrompt: string;
  defaultFirstMessage: string;
  demoAudioUrl: string;
  isPublished: boolean;
  sortOrder: number;
  totalVoices: number;
  // assigned = admin marked Yes
  assigned: boolean;
  // requested = user already sent a request (pending admin action)
  requested: boolean;
  _count: { deployedAgents: number };
};

export function useAgentLibrary() {
  const [agents, setAgents] = useState<AgentEntry[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("agentLibraryCache");
        if (cached) return JSON.parse(cached);
      }
    } catch (e) {}
    return [];
  });
  
  const [loading, setLoading] = useState(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("agentLibraryCache")) {
        return false;
      }
    } catch (e) {}
    return true;
  });

  const fetchAgents = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";
      const res = await fetch("/api/agent-library", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      setAgents(data);
      try {
        localStorage.setItem("agentLibraryCache", JSON.stringify(data));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      if (!isPolling) toast.error("Failed to load agent library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents(false);
    const interval = setInterval(() => {
      fetchAgents(true);
    }, 12000); // 12s polling — picks up admin Yes changes automatically
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const assignedCount = useMemo(
    () => agents.filter((a) => a.assigned).length,
    [agents]
  );

  const totalCount = useMemo(
    () => agents.length,
    [agents]
  );

  const requestAssign = useCallback(async (id: string) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    // Don't allow if already assigned
    if (agent.assigned) return;

    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";
    const res = await fetch("/api/agent-library/assign-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ agentId: id }),
    });
    if (!res.ok) throw new Error("Failed to send assignment request");
  }, [agents]);

  return {
    agents,
    assignedCount,
    totalCount,
    loading,
    requestAssign,
  };
}
