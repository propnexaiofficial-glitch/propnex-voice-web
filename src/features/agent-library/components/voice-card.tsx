"use client";

import { Check, UserPlus, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceAudioPlayer } from "@/features/agent-library/components/voice-audio-player";
import type { VoiceAgent } from "@/features/agent-library/types";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAgentMeta(agent: VoiceAgent) {
  return {
    gender: agent.tags.find((tag) => tag.category === "gender")?.label,
    accent: agent.tags.find((tag) => tag.category === "accent")?.label,
    tone: agent.tags.find((tag) => tag.category === "tone")?.label,
    useCase: agent.tags.find((tag) => tag.category === "use-case")?.label,
  };
}

type VoiceCardProps = {
  agent: VoiceAgent;
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
        "glass-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:border-primary/20",
        agent.assigned && "ring-1 ring-primary/20"
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          <Avatar className="size-14 rounded-xl border-border">
            <AvatarImage
              src={agent.coverImage}
              alt={agent.name}
              className="rounded-xl object-cover"
            />
            <AvatarFallback className="rounded-xl text-sm font-semibold">
              {getInitials(agent.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-semibold tracking-tight">{agent.name}</h3>
                {meta.useCase && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{meta.useCase}</p>
                )}
              </div>
              {agent.assigned && (
                <Badge variant="success" className="shrink-0 text-[10px]">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {agent.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {meta.tone && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Tone
              </p>
              <p className="mt-0.5 text-xs font-medium">{meta.tone}</p>
            </div>
          )}
          {meta.accent && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Language
              </p>
              <p className="mt-0.5 text-xs font-medium">{meta.accent}</p>
            </div>
          )}
          {meta.gender && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Voice
              </p>
              <p className="mt-0.5 text-xs font-medium">{meta.gender}</p>
            </div>
          )}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Best for
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs font-medium">{agent.recommendedFor}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-border/60 pt-4">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Volume2 className="size-3.5" />
            Voice preview
          </div>
          <VoiceAudioPlayer
            durationSeconds={agent.sampleDurationSeconds}
            accent={agent.accent}
            variant="card"
          />
        </div>

        <Button
          type="button"
          variant={agent.assigned ? "outline" : "default"}
          className={cn(
            "mt-4 w-full",
            agent.assigned &&
              "border-emerald-500/30 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
          )}
          onClick={() => onAssign(agent.id)}
        >
          {agent.assigned ? (
            <>
              <Check className="size-4" />
              Assigned to campaign
            </>
          ) : (
            <>
              <UserPlus className="size-4" />
              Assign to campaign
            </>
          )}
        </Button>
      </div>
    </motion.article>
  );
}
