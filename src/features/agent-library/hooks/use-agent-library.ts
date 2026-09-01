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
  assigned: boolean;
  _count: { deployedAgents: number };
};

const getGlobalAgentsCache = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem("globalAgentsCache");
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
};

let globalAgentsCache: AgentEntry[] | null = getGlobalAgentsCache();

const saveGlobalAgentsCache = () => {
  if (typeof window !== "undefined" && globalAgentsCache) {
    try {
      sessionStorage.setItem("globalAgentsCache", JSON.stringify(globalAgentsCache));
    } catch {}
  }
};
export function useAgentLibrary() {
  const [agents, setAgents] = useState<AgentEntry[]>(globalAgentsCache || []);
  const [loading, setLoading] = useState(!globalAgentsCache);

  const fetchAgents = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling && agents.length === 0) setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";
      const res = await fetch("/api/agent-library", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      globalAgentsCache = data;
      saveGlobalAgentsCache();
      setAgents(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load agent library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents(false);
    const interval = setInterval(() => {
      fetchAgents(true);
    }, 15000); // 15s polling
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

  const toggleAssign = useCallback(async (id: string) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    if (agent.assigned) return;

    try {
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
      toast.success("Assignment request sent to admin!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to request agent assignment");
    }
  }, [agents]);

  return {
    agents,
    assignedCount,
    totalCount,
    loading,
    toggleAssign,
  };
}
