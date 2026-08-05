"use client";

import { useCallback, useMemo, useState } from "react";

import { voiceAgents } from "@/features/agent-library/data";
import {
  DEFAULT_AGENT_FILTERS,
  type AgentLibraryFilters,
  type VoiceAgent,
} from "@/features/agent-library/types";

function matchesSearch(agent: VoiceAgent, search: string) {
  if (!search.trim()) return true;
  const query = search.toLowerCase();
  return (
    agent.name.toLowerCase().includes(query) ||
    agent.description.toLowerCase().includes(query) ||
    agent.tags.some((tag) => tag.label.toLowerCase().includes(query))
  );
}

function matchesTag(agent: VoiceAgent, tag: string) {
  if (tag === "all") return true;
  return agent.tags.some((t) => t.label === tag);
}

export function useAgentLibrary() {
  const [agents, setAgents] = useState<VoiceAgent[]>(voiceAgents);
  const [filters, setFilters] = useState<AgentLibraryFilters>(
    DEFAULT_AGENT_FILTERS
  );

  const filteredAgents = useMemo(() => {
    return agents.filter(
      (agent) =>
        matchesSearch(agent, filters.search) && matchesTag(agent, filters.tag)
    );
  }, [agents, filters]);

  const assignedCount = useMemo(
    () => agents.filter((a) => a.assigned).length,
    [agents]
  );

  const toggleAssign = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, assigned: !agent.assigned } : agent
      )
    );
  }, []);

  return {
    agents: filteredAgents,
    filters,
    setFilters,
    assignedCount,
    totalCount: agents.length,
    toggleAssign,
  };
}
