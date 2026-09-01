"use client";

import { Check, UserPlus, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const isAssigned = agent.assigned;

  const handleAssignClick = async () => {
    if (isAssigned || loading) return;

    setLoading(true);
    try {
      await onAssign(agent.id);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3500); // Revert back to white button after 3.5 seconds
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] bg-[#161719] ring-1 ring-white/5 text-white transition-all duration-200"
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-2xl border-none bg-[#24252A]">
              <AvatarFallback className="rounded-2xl bg-[#24252A] text-base font-bold text-white">
                {getInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">{agent.name}</h3>
              <p className="text-sm text-zinc-400">{agent.category}</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-none px-3 py-1 font-medium rounded-full">
            Active
          </Badge>
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">
          {agent.profile}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">TONE</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">{agent.tone || "Professional"}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">LANGUAGE</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">{agent.language || "English"}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">VOICE</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">{agent.voice || "Female"}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">BEST FOR</p>
            <p className="mt-1 truncate text-sm font-semibold text-zinc-100">{agent.bestFor || "Inbound calls"}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
          <Volume2 className="size-4" />
          <span>Voice preview</span>
        </div>

        <VoiceAudioPlayer
          src={agent.demoAudioUrl || ""}
          className="mb-5"
        />

        <Button
          className={cn(
            "w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300",
            isAssigned
              ? "bg-transparent border border-[#00d084] text-[#00d084] cursor-default"
              : showNotification
                ? "bg-white/10 border border-white/20 text-white/70 cursor-default"
                : loading
                  ? "bg-white/80 text-black/60 cursor-wait"
                  : "bg-white text-black cursor-pointer hover:bg-zinc-100 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
          )}
          onClick={handleAssignClick}
          disabled={loading || isAssigned || showNotification}
        >
          {isAssigned ? (
            <span className="flex items-center gap-2">
              <Check className="size-4" />
              Assigned Campaign
            </span>
          ) : showNotification ? (
            <span className="flex items-center gap-2 text-[13px]">
              <Check className="size-4 shrink-0" />
              Admin is notified — we will let you know
            </span>
          ) : loading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              Sending...
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
