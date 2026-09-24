"use client";

import { CheckCircle2, Headphones, Mic2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

import { cn } from "@/lib/utils";
import { VoiceCard } from "@/features/agent-library/components/voice-card";
import { useAgentLibrary } from "@/features/agent-library/hooks/use-agent-library";

type LibraryStatProps = {
  label: string;
  value: number;
  icon: LucideIcon;
};

function LibraryStat({ label, value, icon: Icon }: LibraryStatProps) {
  return (
    <div className="glass-card flex items-center gap-3 rounded-xl px-4 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tabular-nums tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export function AgentLibraryPageContent() {
  const { agents, assignedCount, totalCount, requestAssign } = useAgentLibrary();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const availableCount = totalCount - assignedCount;

  // Derive unique categories from agents
  const categories = useMemo(() => {
    const cats = new Set<string>();
    agents.forEach(a => {
      if (a.category) cats.add(a.category);
    });
    // Let's also include the ones the user explicitly asked for if they want them, but dynamic is better.
    // If the backend has slightly different names, dynamic captures them.
    return ["All", ...Array.from(cats)].sort();
  }, [agents]);

  // Filter agents based on selected category
  const filteredAgents = useMemo(() => {
    if (selectedCategory === "All") return agents;
    return agents.filter(a => a.category === selectedCategory);
  }, [agents, selectedCategory]);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Mic2 className="size-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Agent Library</h2>
            <p className="text-sm text-muted-foreground">
              Browse AI voice agents and assign them to your campaigns
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LibraryStat label="Total voices" value={totalCount} icon={Headphones} />
        <LibraryStat label="Assigned" value={assignedCount} icon={CheckCircle2} />
        <LibraryStat label="Available" value={availableCount} icon={Mic2} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
              selectedCategory === cat
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{filteredAgents.length}</span>{" "}
        voice{filteredAgents.length !== 1 ? "s" : ""}
        {selectedCategory !== "All" && ` in ${selectedCategory}`}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAgents.map((agent, index) => (
          <VoiceCard
            key={agent.id}
            agent={agent}
            index={index}
            onAssign={requestAssign}
          />
        ))}
      </div>
    </div>
  );
}
