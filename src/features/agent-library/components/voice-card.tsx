"use client";

import { Check, UserPlus, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceAudioPlayer } from "@/features/agent-library/components/voice-audio-player";
import type { AgentEntry } from "@/features/agent-library/hooks/use-agent-library";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAgentMeta(agent: AgentEntry) {
  return {
    useCases: agent.useCases.slice(0, 2).join(", "),
    category: agent.category,
    defaultType: agent.defaultType,
  };
}

type VoiceCardProps = {
  agent: AgentEntry;
  index?: number;
  onAssign: (id: string) => void;
};

export function VoiceCard({ agent, index = 0, onAssign }: VoiceCardProps) {
  const meta = getAgentMeta(agent);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "glass-card group flex flex-col overflow-hidden rounded-lg transition-all duration-200 hover:border-border",
        agent.assigned && "ring-1 ring-border"
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          <Avatar className="size-14 rounded-xl border-border">
            <AvatarFallback className="rounded-xl bg-muted text-sm font-semibold text-foreground">
              {getInitials(agent.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-semibold tracking-tight">{agent.name}</h3>
                {meta.useCases && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{meta.useCases}</p>
                )}
              </div>
              {agent.assigned && (
                <Badge variant="success" className="shrink-0 text-[10px]">
                  Assigned
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {agent.profile}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {meta.category && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Category
              </p>
              <p className="mt-0.5 text-xs font-medium">{meta.category}</p>
            </div>
          )}
          {meta.defaultType && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Default Type
              </p>
              <p className="mt-0.5 text-xs font-medium">{meta.defaultType}</p>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border/60 bg-muted/20 p-4">
        <div className="flex flex-col gap-3">
          <VoiceAudioPlayer 
            src={agent.demoAudioUrl || "https://example.com/placeholder.mp3"} 
          />
          <Button
            variant={agent.assigned ? "secondary" : "default"}
            className="w-full justify-between"
            onClick={() => onAssign(agent.id)}
          >
            <span className="flex items-center gap-2">
              {agent.assigned ? (
                <>
                  <Check className="size-4" />
                  Revoke Assignment
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Assign to Campaign
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
