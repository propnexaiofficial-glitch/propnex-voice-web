"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Build the src URL for the <audio> element.
 * - For Google Drive URLs  → route through /api/audio-proxy (server-side, no CORS)
 * - For everything else    → use as-is
 */
function buildAudioSrc(url: string): string {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    return `/api/audio-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function VoiceAudioPlayer({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [duration, setDuration]   = useState<number | null>(null);
  const [current, setCurrent]     = useState(0);
  const [error, setError]         = useState(false);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const barRef     = useRef<HTMLDivElement>(null);

  const audioSrc = buildAudioSrc(src);

  // ── Event listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    // Reset when src changes
    setIsPlaying(false);
    setProgress(0);
    setCurrent(0);
    setDuration(null);
    setError(false);

    const onTime = () => {
      setCurrent(el.currentTime);
      if (el.duration && isFinite(el.duration)) {
        setProgress((el.currentTime / el.duration) * 100);
      }
    };

    const onMeta = () => {
      if (el.duration && isFinite(el.duration) && el.duration > 0) {
        setDuration(el.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrent(0);
      el.currentTime = 0;
    };

    const onError = () => {
      setError(true);
      setIsPlaying(false);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    el.addEventListener("timeupdate",    onTime);
    el.addEventListener("loadedmetadata",onMeta);
    el.addEventListener("durationchange",onMeta);
    el.addEventListener("ended",         onEnded);
    el.addEventListener("error",         onError);
    el.addEventListener("play",          onPlay);
    el.addEventListener("pause",         onPause);

    return () => {
      el.removeEventListener("timeupdate",    onTime);
      el.removeEventListener("loadedmetadata",onMeta);
      el.removeEventListener("durationchange",onMeta);
      el.removeEventListener("ended",         onEnded);
      el.removeEventListener("error",         onError);
      el.removeEventListener("play",          onPlay);
      el.removeEventListener("pause",         onPause);
    };
  }, [audioSrc]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      try {
        setError(false);
        document.querySelectorAll("audio").forEach((a) => {
          if (a !== el) a.pause();
        });
        await el.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Playback failed:", e);
        setError(true);
        setIsPlaying(false);
      }
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !barRef.current) return;
    const { left, width } = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - left) / width));
    if (el.duration && isFinite(el.duration)) {
      el.currentTime = ratio * el.duration;
    }
  };

  const fmt = (t: number): string => {
    if (!isFinite(t) || t < 0) return "0:00";
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!src) {
    return (
      <div className={cn("text-xs italic text-zinc-600", className)}>
        No recording uploaded
      </div>
    );
  }

  // ── Player ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        className="hidden"
      />

      <button
        onClick={toggle}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center bg-transparent text-zinc-300 hover:text-white transition-colors",
          error && "text-red-400 cursor-not-allowed"
        )}
      >
        {isPlaying ? (
          <Pause className="size-3.5 fill-current" />
        ) : (
          <Play className="size-3.5 fill-current" />
        )}
      </button>

      <div className="text-xs tabular-nums text-zinc-400 font-medium">
        {error ? "Error" : fmt(current)}
      </div>

      <div
        ref={barRef}
        onClick={seek}
        className="relative flex-1 h-1 cursor-pointer rounded-full bg-white/10"
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-white/50 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-xs tabular-nums text-zinc-400 font-medium">
        {duration ? fmt(duration) : (error ? "0:00" : "...")}
      </div>
    </div>
  );
}