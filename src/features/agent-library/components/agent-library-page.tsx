"use client";

import { Mic2 } from "lucide-react";
import { motion } from "framer-motion";

import { EmptyState } from "@/components/common/empty-state";
import { PremiumChip, PremiumLabel } from "@/components/common/premium-badge";
import { AgentLibraryFiltersBar } from "@/features/agent-library/components/agent-library-filters";
import { VoiceCard } from "@/features/agent-library/components/voice-card";
import { useAgentLibrary } from "@/features/agent-library/hooks/use-agent-library";

export function AgentLibraryPageContent() {
  const {
    agents,
    filters,
    setFilters,
    assignedCount,
    totalCount,
    toggleAssign,
  } = useAgentLibrary();

  return (
    <div className="page-mesh-bg -m-4 space-y-6 rounded-none p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="voice-icon-ring voice-icon-purple">
            <div className="relative flex size-11 items-center justify-center rounded-xl gradient-primary glow-purple">
              <Mic2 className="size-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Agent <span className="text-gradient-primary">Library</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Browse voice samples and assign agents to your campaigns
            </p>
          </div>
        </div>

        <PremiumChip>
          <PremiumLabel text={`${totalCount} premium voices available`} />
        </PremiumChip>
      </motion.div>

      <AgentLibraryFiltersBar
        filters={filters}
        onChange={setFilters}
        totalCount={totalCount}
        assignedCount={assignedCount}
      />

      {agents.length === 0 ? (
        <EmptyState
          title="No voices found"
          description="Try a different search term or filter to discover available agents."
        />
      ) : (
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-semibold tracking-tight">
              Popular Voice Agents
            </h3>
            <p className="text-sm text-muted-foreground">
              AI-powered voices ready for inbound and outbound calls
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, index) => (
              <VoiceCard
                key={agent.id}
                agent={agent}
                index={index}
                onAssign={toggleAssign}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
