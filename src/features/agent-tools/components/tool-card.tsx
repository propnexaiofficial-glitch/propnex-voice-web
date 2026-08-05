"use client";

import {
  Bot,
  Calendar,
  Database,
  Headphones,
  RefreshCw,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentTool } from "@/features/agent-tools/types";

type ToolCardProps = {
  tool: AgentTool;
  index: number;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onConfigure: (id: string) => void;
};

const accentStyles = {
  purple: "bg-primary/15 text-primary border-primary/25",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  gold: "bg-gold/15 text-gold border-gold/25",
  pink: "bg-pink-500/15 text-pink-400 border-pink-500/25",
};

const iconMap: Record<string, LucideIcon> = {
  "Lead Reactivation Agent": RefreshCw,
  "Appointment Booker": Calendar,
  "Follow-Up Sequencer": Zap,
  "Objection Handler": Target,
  "Market Insights Bot": Database,
  "Complaint Resolver": Headphones,
};

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  configured: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  inactive: "bg-white/5 text-muted-foreground border-white/10",
};

export function ToolCard({
  tool,
  index,
  onActivate,
  onDeactivate,
  onConfigure,
}: ToolCardProps) {
  const Icon = iconMap[tool.name] ?? Bot;
  const isActive = tool.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        "tool-card flex flex-col rounded-2xl border p-5",
        tool.isPremium ? "border-gold/25" : "border-white/10"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            accentStyles[tool.accent]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tool.isPremium && <PremiumBadge size="sm" />}
          <Badge
            variant="outline"
            className={cn("text-[10px] capitalize", statusStyles[tool.status])}
          >
            {tool.status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <Badge variant="outline" className="mb-2 text-[10px]">
            {tool.category}
          </Badge>
          <h3 className="text-base font-semibold leading-snug">{tool.name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tool.features.map((feature) => (
            <span
              key={feature}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
        {isActive ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDeactivate(tool.id)}
          >
            Deactivate
          </Button>
        ) : (
          <Button
            variant={tool.isPremium ? "gold" : "default"}
            size="sm"
            className="flex-1"
            onClick={() => onActivate(tool.id)}
          >
            Activate
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onConfigure(tool.id)}
        >
          Configure
        </Button>
      </div>
    </motion.div>
  );
}
