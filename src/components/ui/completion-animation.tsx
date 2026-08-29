"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CalendarClock, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface CompletionAnimationProps {
  title: string;
  subtitle?: string;
  onComplete: () => void;
  durationMs?: number;
  type?: "campaign" | "schedule" | "force_stopped";
}

export function CompletionAnimation({
  title,
  subtitle,
  onComplete,
  durationMs,
  type = "campaign",
}: CompletionAnimationProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(type === "campaign");
  const [visible, setVisible] = useState(true);
  const duration = durationMs ?? (type === "campaign" ? 6000 : 5000); // Enough time for scrolling
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const confettiTimer = type === "campaign"
      ? setTimeout(() => setShowConfetti(false), duration - 2000)
      : undefined;

    const exitTimer = setTimeout(() => {
      setVisible(false);
    }, duration - 500);

    const doneTimer = setTimeout(() => {
      onCompleteRef.current();
    }, duration);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, type]);

  const isCampaign = type === "campaign";
  const isForceStopped = type === "force_stopped";
  
  const glowColorClass = isForceStopped 
    ? "from-destructive/50 to-destructive/80" 
    : "from-primary/50 to-primary/80";
    
  const bgClass = isForceStopped
    ? "bg-destructive/10 border-destructive/20 text-foreground"
    : "bg-primary/10 border-primary/20 text-foreground";

  return (
    <AnimatePresence>
      {visible && (
        <>
          {showConfetti && type === "campaign" && (
             <div className="fixed inset-0 z-[120] pointer-events-none">
               <Confetti
                 width={width}
                 height={height}
                 recycle={false}
                 numberOfPieces={250}
                 gravity={0.15}
                 colors={["#818cf8", "#a78bfa", "#c084fc", "#f472b6", "#facc15", "#34d399"]}
               />
             </div>
          )}
          
          <motion.div
            key="banner"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bottom-6 left-6 right-6 z-[110] overflow-hidden rounded-2xl border ${bgClass} shadow-2xl backdrop-blur-xl bg-background/80`}
          >
            {/* Glossy gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${glowColorClass} opacity-10 pointer-events-none`} />
            
            <div className="relative flex items-center p-4 sm:p-5 gap-4">
               {isCampaign ? (
                 <CheckCircle2 className="size-8 shrink-0 animate-pulse drop-shadow-md" />
               ) : (
                 <CalendarClock className="size-8 shrink-0 animate-pulse drop-shadow-md" />
               )}
               
               {/* Marquee scrolling container */}
               <div className="flex-1 overflow-hidden whitespace-nowrap relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                 <motion.div 
                   className="inline-block"
                   animate={{ x: ["100%", "-100%"] }}
                   transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                 >
                   <span className="text-xl sm:text-2xl font-bold tracking-tight pr-6 drop-shadow-sm">
                     {title}
                   </span>
                   {subtitle && (
                     <span className="text-base sm:text-lg opacity-80 border-l-2 border-current pl-6 ml-2 inline-flex items-center">
                       {subtitle}
                     </span>
                   )}
                 </motion.div>
               </div>
               
               <button 
                 onClick={() => {
                   setVisible(false);
                 }}
                 className="shrink-0 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-20"
               >
                 <X className="size-5" />
               </button>
            </div>
            
            {/* Auto-dismiss Progress bar */}
            <motion.div 
              className={`h-1.5 bg-gradient-to-r ${glowColorClass}`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000 - 0.5, ease: "linear" }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
