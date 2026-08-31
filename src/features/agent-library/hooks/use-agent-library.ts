"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type AgentEntry = {
  id: string;
  slug: string;
  name: string;
  profile: string;
  category: string;
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

export function useAgentLibrary() {
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";
      const res = await fetch("/api/agent-library", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load agent library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const assignedCount = useMemo(
    () => agents.filter((a) => a.assigned).length,
    [agents]
  );

  const totalCount = useMemo(
    () => agents.reduce((acc, a) => acc + (a.totalVoices || 0), 0),
    [agents]
  );

  const toggleAssign = useCallback(async (id: string) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    const isAssigning = !agent.assigned;

    // Optimistic update
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, assigned: isAssigning } : a
      )
    );

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";
      const res = await fetch("/api/agent-library/assign", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ agentId: id, assign: isAssigning }),
      });
      if (!res.ok) throw new Error("Failed to update assignment");
      toast.success(isAssigning ? "Agent assigned successfully!" : "Agent revoked successfully!");
      // Re-fetch to update actual assigned numbers and availability
      fetchAgents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update agent assignment");
      // Revert optimistic update
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, assigned: !isAssigning } : a
        )
      );
    }
  }, [agents, fetchAgents]);

  return {
    agents,
    assignedCount,
    totalCount,
    loading,
    toggleAssign,
  };
}
