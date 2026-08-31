"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type VoiceAudioPlayerProps = {
  src: string;
  className?: string;
};

export function VoiceAudioPlayer({ src, className }: VoiceAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    audioRef.current = new Audio(src);
    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setProgress(audio.currentTime);
    };

    const onAudioEnd = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", onAudioEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", onAudioEnd);
      audio.pause();
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const percent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <button
        onClick={togglePlay}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
        )}
      >
        {isPlaying ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="ml-0.5 size-4 fill-current" />
        )}
      </button>

      <div className="flex flex-1 items-center gap-2 text-xs font-medium tabular-nums text-muted-foreground">
        <span className="w-8 text-right">{formatTime(progress)}</span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/50">
          <div
            className="absolute inset-y-0 left-0 bg-foreground transition-all duration-100 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="w-8">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
