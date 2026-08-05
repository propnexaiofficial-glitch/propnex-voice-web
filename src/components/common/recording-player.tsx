"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type RecordingPlayerProps = {
  durationSeconds: number;
  label?: string;
  compact?: boolean;
  className?: string;
};

export function RecordingPlayer({
  durationSeconds,
  label = "Recording",
  compact = false,
  className,
}: RecordingPlayerProps) {
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

  const handleToggle = () => {
    if (progress >= durationSeconds) {
      setProgress(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const progressPercent =
    durationSeconds > 0 ? (progress / durationSeconds) * 100 : 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleToggle}
          aria-label={isPlaying ? "Pause recording" : "Play recording"}
        >
          {isPlaying ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          {formatTime(progress)} / {formatTime(durationSeconds)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 space-y-3 min-w-[220px]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTime(progress)} / {formatTime(durationSeconds)}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full gradient-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <Button
        variant={isPlaying ? "secondary" : "default"}
        size="sm"
        className="w-full"
        onClick={handleToggle}
      >
        {isPlaying ? (
          <>
            <Pause className="size-4" />
            Pause
          </>
        ) : (
          <>
            <Play className="size-4" />
            Play Recording
          </>
        )}
      </Button>
    </div>
  );
}
