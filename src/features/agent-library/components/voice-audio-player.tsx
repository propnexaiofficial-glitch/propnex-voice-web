"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type VoiceAudioPlayerProps = {
  src: string;
  className?: string;
};

export function VoiceAudioPlayer({ src, className }: VoiceAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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

    // If it's already loaded metadata before we attached listeners
    if (audio.readyState >= 1) {
      setAudioData();
    }

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", onAudioEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", onAudioEnd);
    };
  }, []);

  // When src changes, reset player state
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
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
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button
        onClick={togglePlay}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95"
        )}
      >
        {isPlaying ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="ml-0.5 size-5 fill-current" />
        )}
      </button>

      <div className="flex flex-1 items-center gap-3 text-xs font-medium tabular-nums text-zinc-400">
        <span className="w-8 text-right">{formatTime(progress)}</span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 bg-white transition-all duration-100 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="w-8">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
