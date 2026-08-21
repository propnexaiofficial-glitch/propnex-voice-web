"use client";

import { useEffect, useState, useRef } from "react";
import { Pause, Play, RotateCw } from "lucide-react";

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
  const [hasError, setHasError] = useState(() => {
    if (typeof window !== 'undefined' && audioUrl) {
      return sessionStorage.getItem(`rec_fail_${audioUrl}`) === 'true';
    }
    return false;
  });
  const [isValidating, setIsValidating] = useState(() => {
    if (typeof window !== 'undefined' && audioUrl) {
      return sessionStorage.getItem(`rec_fail_${audioUrl}`) !== 'true';
    }
    return !!audioUrl;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Exclusive playback listener
  useEffect(() => {
    const handleGlobalPlay = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== audioUrl && isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
    };
    window.addEventListener("recording-play", handleGlobalPlay);
    return () => window.removeEventListener("recording-play", handleGlobalPlay);
  }, [audioUrl, isPlaying]);

  const [retryCount, setRetryCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const durationRef = useRef(durationSeconds);
  
  useEffect(() => {
    durationRef.current = durationSeconds;
  }, [durationSeconds]);

  // Initialize the audio element when the URL is available
  useEffect(() => {
    if (!audioUrl || hasError) return; // Skip initialization if already marked as error from cache

    let isMounted = true;
    setIsValidating(true);

    const buster = (retryCount > 0 || reloadKey > 0) ? (audioUrl.includes('?') ? `&_t=${Date.now()}` : `?_t=${Date.now()}`) : '';
    const audio = new Audio(audioUrl + buster);
    audio.preload = "metadata";
    audioRef.current = audio;

    // Force the browser to start fetching the metadata immediately.
    audio.load();

    const updateTime = () => {
      setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(durationRef.current > 0 ? durationRef.current : audio.duration || 0);
    };

    const handleError = () => {
      if (!isMounted) return;
      if (retryCount < 2) { // Reduced to 2 retries to avoid long spinners
        // Retry after 2 seconds (S3 eventual consistency)
        setTimeout(() => {
          if (isMounted) setRetryCount((prev) => prev + 1);
        }, 2000);
      } else {
        setHasError(true);
        setIsValidating(false);
        setIsPlaying(false);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`rec_fail_${audioUrl}`, 'true');
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (!isMounted) return;
      setHasError(false);
      setIsValidating(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`rec_fail_${audioUrl}`);
      }
    };

    if (audio.readyState >= 1) {
      setIsValidating(false);
    }

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleLoadedMetadata);

    return () => {
      isMounted = false;
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleLoadedMetadata);
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl, retryCount, reloadKey]);

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
        // Dispatch event so other players pause
        window.dispatchEvent(new CustomEvent("recording-play", { detail: audioUrl }));
      }).catch(err => {
        console.error("Failed to play audio:", err);
        if (err.name !== "NotAllowedError") {
          setHasError(true);
        }
      });
    }
  };

  const currentDuration = durationSeconds > 0 ? durationSeconds : (audioRef.current?.duration || 0);
  const progressPercent = currentDuration > 0 ? (progress / currentDuration) * 100 : 0;

  if (compact) {
    if (hasError) {
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <span className="text-xs text-destructive flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
            Not found
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setHasError(false);
              setIsValidating(true);
              setRetryCount(0);
              setReloadKey(k => k + 1);
            }}
            aria-label="Retry loading recording"
            title="Retry loading recording"
          >
            <RotateCw className="size-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleToggle}
          disabled={!audioUrl || isValidating}
          aria-label={isPlaying ? "Pause recording" : "Play recording"}
        >
          {isValidating ? (
            <span className="size-3.5 border-[1.5px] border-muted-foreground border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>
        <span className="text-xs text-muted-foreground min-w-[70px]">
          {formatTime(progress)} / {formatTime(currentDuration)}
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "glass-card rounded-xl p-4 space-y-3 min-w-[220px] flex flex-col items-center justify-center",
          className
        )}
      >
        <span className="text-xs font-medium text-destructive">Recording Not Found</span>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8"
          onClick={() => {
            setHasError(false);
            setIsValidating(true);
            setRetryCount(0);
            setReloadKey(k => k + 1);
          }}
        >
          <RotateCw className="size-3.5 mr-1.5" />
          Retry
        </Button>
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
        disabled={!audioUrl || isValidating}
      >
        {isValidating ? (
          <>
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
            Loading...
          </>
        ) : isPlaying ? (
          <>
            <Pause className="size-4 mr-1" />
            Pause
          </>
        ) : (
          <>
            <Play className="size-4 mr-1" />
            Play Recording
          </>
        )}
      </Button>
    </div>
  );
}
