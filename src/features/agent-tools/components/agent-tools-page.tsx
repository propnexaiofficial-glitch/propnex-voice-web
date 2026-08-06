"use client";

import { Wrench } from "lucide-react";
import { motion } from "framer-motion";

import { PremiumChip } from "@/components/common/premium-badge";
import { ConfigureToolModal } from "@/features/agent-tools/components/configure-tool-modal";
import { ToolCard } from "@/features/agent-tools/components/tool-card";
import { useAgentTools } from "@/features/agent-tools/hooks/use-agent-tools";

export function AgentToolsPageContent() {
  const {
    tools,
    configTool,
    config,
    configOpen,
    activeCount,
    premiumCount,
    activateTool,
    deactivateTool,
    openConfigure,
    closeConfigure,
    saveConfig,
    updateConfig,
  } = useAgentTools();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Wrench className="size-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Agent Tools & Libraries</h2>
            <p className="text-sm text-muted-foreground">
              Activate and configure AI tools for your voice agents
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {activeCount} active
          </span>
          {premiumCount > 0 && (
            <PremiumChip>{premiumCount} premium tools available</PremiumChip>
          )}
        </div>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool, index) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            index={index}
            onActivate={activateTool}
            onDeactivate={deactivateTool}
            onConfigure={openConfigure}
          />
        ))}
      </div>

      <ConfigureToolModal
        tool={configTool}
        config={config}
        open={configOpen}
        onOpenChange={(open) => !open && closeConfigure()}
        onSave={saveConfig}
        onConfigChange={updateConfig}
      />
    </div>
  );
}
