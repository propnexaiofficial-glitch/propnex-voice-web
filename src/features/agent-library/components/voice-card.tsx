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

type VoiceCardProps = {
  agent: AgentEntry;
  index?: number;
  onAssign: (id: string) => void;
};

export function VoiceCard({ agent, index = 0, onAssign }: VoiceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "glass-card group flex flex-col overflow-hidden rounded-xl bg-[#131417] text-white transition-all duration-200 hover:border-border",
        agent.assigned && "ring-1 ring-emerald-500/50"
      )}
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-2xl border-none bg-[#24252A]">
              <AvatarFallback className="rounded-2xl bg-[#24252A] text-lg font-bold text-white">
                {getInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">{agent.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{agent.category}</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-none px-3 py-1 font-medium">
            Active
          </Badge>
        </div>

        <p className="mt-6 text-base leading-relaxed text-zinc-300">
          {agent.profile}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              TONE
            </p>
            <p className="mt-1.5 text-sm font-semibold text-zinc-100">{agent.tone || "Professional"}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              LANGUAGE
            </p>
            <p className="mt-1.5 text-sm font-semibold text-zinc-100">{agent.language || "English"}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              VOICE
            </p>
            <p className="mt-1.5 text-sm font-semibold text-zinc-100">{agent.voice || "Female"}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              BEST FOR
            </p>
            <p className="mt-1.5 truncate text-sm font-semibold text-zinc-100">{agent.bestFor || "Inbound calls"}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
          <Volume2 className="size-4" />
          <span>Voice preview</span>
        </div>
        
        <VoiceAudioPlayer 
          src={agent.demoAudioUrl || "https://example.com/placeholder.mp3"} 
          className="mb-6"
        />

        <Button
          className={cn(
            "w-full rounded-xl py-6 text-sm font-semibold transition-all",
            agent.assigned 
              ? "bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              : "bg-white text-black hover:bg-zinc-200"
          )}
          onClick={() => onAssign(agent.id)}
        >
          {agent.assigned ? (
            <span className="flex items-center gap-2">
              <Check className="size-4" />
              Assigned to campaign
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus className="size-4" />
              Assign to campaign
            </span>
          )}
        </Button>
      </div>
    </motion.article>
  );
}
