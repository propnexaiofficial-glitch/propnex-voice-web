"use client";

import { Check, Mic2, Sparkles, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { VoiceAudioPlayer } from "@/features/agent-library/components/voice-audio-player";
import type { VoiceAccent, VoiceAgent } from "@/features/agent-library/types";
import { cn } from "@/lib/utils";

const accentBar: Record<VoiceAccent, string> = {
  purple: "gradient-primary",
  blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
  green: "bg-gradient-to-r from-emerald-500 to-green-400",
  gold: "gradient-gold",
  pink: "bg-gradient-to-r from-pink-500 to-rose-400",
};

const accentIcon: Record<VoiceAccent, string> = {
  purple: "gradient-primary glow-purple",
  blue: "bg-gradient-to-br from-blue-500 to-cyan-500",
  green: "bg-gradient-to-br from-emerald-500 to-green-400",
  gold: "gradient-gold",
  pink: "bg-gradient-to-br from-pink-500 to-rose-400",
};

type VoiceCardProps = {
  agent: VoiceAgent;
  index?: number;
  onAssign: (id: string) => void;
};

export function VoiceCard({ agent, index = 0, onAssign }: VoiceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121a]/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--glow-purple)]"
    >
      {/* Subtle accent strip — not a hero image */}
      <div className={cn("h-1 w-full shrink-0", accentBar[agent.accent])} />

      <div className="flex flex-1 flex-col p-5">
        {/* Header: small avatar + name */}
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <div className="relative size-14 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[30%]"
                style={{ backgroundImage: `url(${agent.coverImage})` }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div
              className={cn(
                "absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-lg border border-white/20",
                accentIcon[agent.accent]
              )}
            >
              <Mic2 className="size-3.5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-base font-bold tracking-tight text-foreground">
                {agent.name}
              </h3>
              {agent.assigned && (
                <Badge variant="success" className="shrink-0 text-[10px]">
                  Assigned
                </Badge>
              )}
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {agent.description}
            </p>
          </div>
        </div>

        {/* Tags — all visible */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {agent.tags.map((tag) => (
            <Badge
              key={`${agent.id}-${tag.label}`}
              variant="outline"
              className={cn(
                "border-white/10 bg-white/5 text-[11px] font-normal",
                tag.label.toLowerCase() === "premium" && "premium-tag"
              )}
            >
              {tag.label.toLowerCase() === "premium" ? "✦ Premium" : tag.label}
            </Badge>
          ))}
        </div>

        {/* Voice sample */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Voice Sample
          </p>
          <VoiceAudioPlayer
            durationSeconds={agent.sampleDurationSeconds}
            accent={agent.accent}
            variant="card"
          />
        </div>

        {/* Best for */}
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-gold" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-gold">Best for: </span>
            {agent.recommendedFor}
          </p>
        </div>

        {/* Assign */}
        <button
          type="button"
          onClick={() => onAssign(agent.id)}
          className={cn(
            "mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all",
            agent.assigned
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "gradient-primary text-white hover:opacity-90 hover:shadow-[var(--glow-purple)]"
          )}
        >
          {agent.assigned ? (
            <>
              <Check className="size-4" />
              Assigned to Campaign
            </>
          ) : (
            <>
              <UserPlus className="size-4" />
              Assign Voice
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
}
