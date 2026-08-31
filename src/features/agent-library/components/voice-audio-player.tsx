"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to reliably convert Google Drive links to direct streaming links
function getPlayableAudioUrl(url: string) {
  if (!url) return "";
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    // For smaller files, this bypasses the viewer and streams the audio
    // Add &confirm=t to bypass virus scan warnings for slightly larger files
    return `https://drive.google.com/uc?export=download&id=${match[1]}&confirm=t`;
  }
  return url;
}

export function VoiceAudioPlayer({ src, className }: { src: string; className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playableSrc = getPlayableAudioUrl(src);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handleError = (e: any) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [playableSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Small trick to force duration fetch if it's missing (common with streaming)
      if (!duration || !isFinite(duration)) {
        audioRef.current.load();
      }
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <audio 
        ref={audioRef} 
        src={playableSrc} 
        preload="metadata"
        className="hidden" 
      />
      
      <button
        onClick={togglePlay}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-white transition-colors hover:bg-white/[0.1]"
      >
        {isPlaying ? (
          <Square className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex flex-1 items-center gap-3 text-xs font-medium text-zinc-400">
        <div className="relative h-1 w-full rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="w-[70px] shrink-0 text-right tabular-nums">
          {formatTime(currentTime)} / {duration ? formatTime(duration) : "0:18"}
        </div>
      </div>
    </div>
  );
}
