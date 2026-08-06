"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type VoiceAudioPlayerProps = {
  durationSeconds: number;
  accent?: "purple" | "blue" | "green" | "gold" | "pink";
  variant?: "default" | "compact" | "card";
  className?: string;
};

const progressColors = {
  purple: "gradient-primary",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  gold: "gradient-gold",
  pink: "bg-pink-500",
};

export function VoiceAudioPlayer({
  durationSeconds,
  accent = "purple",
  variant = "default",
  className,
}: VoiceAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= durationSeconds) {
          setIsPlaying(false);
          return durationSeconds;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, durationSeconds]);

  const toggle = () => {
    if (progress >= durationSeconds) setProgress(0);
    setIsPlaying((prev) => !prev);
  };

  const progressPercent =
    durationSeconds > 0 ? (progress / durationSeconds) * 100 : 0;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          type="button"
          onClick={toggle}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/20"
          aria-label={isPlaying ? "Pause sample" : "Play sample"}
        >
          {isPlaying ? (
            <Pause className="size-3 text-white" />
          ) : (
            <Play className="size-3 text-white" />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className={cn("h-full rounded-full transition-all duration-300", progressColors[accent])}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] tabular-nums text-white/50">
            {formatTime(progress)} / {formatTime(durationSeconds)}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <button
          type="button"
          onClick={toggle}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 transition-colors hover:border-primary/30 hover:bg-primary/10"
          aria-label={isPlaying ? "Pause sample" : "Play sample"}
        >
          {isPlaying ? (
            <Pause className="size-4 text-primary" />
          ) : (
            <Play className="size-4 text-primary" />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progressColors[accent]
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {formatTime(progress)} / {formatTime(durationSeconds)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-[var(--glow-purple)]"
          aria-label={isPlaying ? "Pause sample" : "Play sample"}
        >
          {isPlaying ? (
            <Pause className="size-4 text-primary" />
          ) : (
            <Play className="size-4 text-primary" />
          )}
        </button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTime(progress)} / {formatTime(durationSeconds)}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-300", progressColors[accent])}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
