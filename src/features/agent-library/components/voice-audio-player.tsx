"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Extract Google Drive file ID from any Drive share URL.
 */
function getDriveFileId(url: string): string | null {
  if (!url || !url.includes("drive.google.com")) return null;
  const match = url.match(/(?:\/d\/|id=|\/file\/d\/)([a-zA-Z0-9_-]{10,})/);
  return match ? match[1] : null;
}

export function VoiceAudioPlayer({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const driveFileId = getDriveFileId(src);
  // For Google Drive: use the streaming export URL with no-cors bypass trick
  const playableSrc = driveFileId
    ? `https://drive.google.com/uc?export=download&id=${driveFileId}&confirm=t`
    : src;
  const driveEmbedUrl = driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(null);
    setHasError(false);

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onDuration = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (audio) audio.currentTime = 0;
    };

    const onError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    const onCanPlay = () => setHasError(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [playableSrc]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setHasError(false);
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Playback failed:", e);
        setHasError(true);
        setIsPlaying(false);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration && isFinite(audio.duration)) {
      audio.currentTime = ratio * audio.duration;
    }
  };

  const formatTime = (time: number): string => {
    if (!isFinite(time) || time < 0) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!src) {
    return (
      <div className={cn("flex items-center gap-3 text-xs text-zinc-600 italic", className)}>
        No recording uploaded
      </div>
    );
  }

  // --- Google Drive file: show custom player + embed fallback on error ---
  if (driveFileId) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {/* Hidden audio fallback attempt */}
        <audio ref={audioRef} src={playableSrc} preload="none" className="hidden" />
        
        {/* Custom player row */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
              hasError
                ? "bg-red-500/10 text-red-400"
                : "bg-white/[0.05] text-white hover:bg-white/[0.1]"
            )}
          >
            {isPlaying ? (
              <Square className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current ml-0.5" />
            )}
          </button>
          <div className="flex flex-1 flex-col gap-1.5">
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/10"
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-white/60 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-500">
              <span>{formatTime(currentTime)}</span>
              <span>{duration !== null ? formatTime(duration) : hasError ? "—" : "Loading..."}</span>
            </div>
          </div>
          {/* Open in Drive link */}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Drive"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        {/* Show Google Drive embedded player if direct audio fails */}
        {hasError && driveEmbedUrl && (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <iframe
              src={driveEmbedUrl}
              allow="autoplay"
              className="h-[50px] w-full border-0"
              title="Voice preview"
            />
          </div>
        )}
      </div>
    );
  }

  // --- Direct file (mp3, mp4, wav, etc.) ---
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
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
          hasError
            ? "bg-red-500/10 text-red-400 cursor-not-allowed"
            : "bg-white/[0.05] text-white hover:bg-white/[0.1]"
        )}
      >
        {isPlaying ? (
          <Square className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current ml-0.5" />
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1.5">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/10"
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white/60 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium tabular-nums text-zinc-500">
          <span>{formatTime(currentTime)}</span>
          <span>
            {hasError
              ? "Error loading audio"
              : duration !== null
              ? formatTime(duration)
              : "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}