"use client";

import { useState } from "react";

import { agentTools, defaultToolConfig } from "@/features/agent-tools/data";
import type { AgentTool, AgentToolStatus, ToolConfig } from "@/features/agent-tools/types";

export function useAgentTools() {
  const [tools, setTools] = useState(agentTools);
  const [configToolId, setConfigToolId] = useState<string | null>(null);
  const [config, setConfig] = useState<ToolConfig>(defaultToolConfig);

  const configTool = tools.find((t) => t.id === configToolId);

  function activateTool(id: string) {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id ? { ...tool, status: "active" as AgentToolStatus } : tool
      )
    );
  }

  function deactivateTool(id: string) {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id ? { ...tool, status: "inactive" as AgentToolStatus } : tool
      )
    );
  }

  function openConfigure(id: string) {
    setConfigToolId(id);
  }

  function closeConfigure() {
    setConfigToolId(null);
  }

  function saveConfig() {
    if (!configToolId) return;
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === configToolId
          ? { ...tool, status: "configured" as AgentToolStatus }
          : tool
      )
    );
    closeConfigure();
  }

  function updateConfig(partial: Partial<ToolConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
  }

  const activeCount = tools.filter((t) => t.status === "active").length;
  const premiumCount = tools.filter((t) => t.isPremium).length;

  return {
    tools,
    configTool,
    config,
    configOpen: configToolId !== null,
    activeCount,
    premiumCount,
    activateTool,
    deactivateTool,
    openConfigure,
    closeConfigure,
    saveConfig,
    updateConfig,
  };
}
