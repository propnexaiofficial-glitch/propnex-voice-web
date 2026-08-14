"use client";

import { useEffect, useState, useRef } from "react";
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
  audioUrl?: string | null;
  label?: string;
  compact?: boolean;
  className?: string;
};

export function RecordingPlayer({
  durationSeconds,
  audioUrl,
  label = "Recording",
  compact = false,
  className,
}: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element when the URL is available
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const updateTime = () => {
      setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(durationSeconds > 0 ? durationSeconds : audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl, durationSeconds]);

  const handleToggle = () => {
    if (!audioRef.current) {
      if (audioUrl) {
        window.open(audioUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // If we finished, restart
      if (progress >= durationSeconds && durationSeconds > 0) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Failed to play audio:", err);
        // Fallback to opening in new tab if browser blocked autoplay
        window.open(audioUrl!, "_blank", "noopener,noreferrer");
      });
    }
  };

  const currentDuration = durationSeconds > 0 ? durationSeconds : (audioRef.current?.duration || 0);
  const progressPercent = currentDuration > 0 ? (progress / currentDuration) * 100 : 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleToggle}
          disabled={!audioUrl}
          aria-label={isPlaying ? "Pause recording" : "Play recording"}
        >
          {isPlaying ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          {formatTime(progress)} / {formatTime(currentDuration)}
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
          {formatTime(progress)} / {formatTime(currentDuration)}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <Button
        variant={isPlaying ? "secondary" : "default"}
        size="sm"
        className="w-full"
        onClick={handleToggle}
        disabled={!audioUrl}
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
