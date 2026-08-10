"use client";

import { useCallback, useMemo, useState } from "react";

import { voiceAgents } from "@/features/agent-library/data";

export function useAgentLibrary() {
  const [agents, setAgents] = useState(voiceAgents);

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
    agents,
    assignedCount,
    totalCount: agents.length,
    toggleAssign,
  };
}
