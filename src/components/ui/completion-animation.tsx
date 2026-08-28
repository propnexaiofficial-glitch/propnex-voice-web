"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface CompletionAnimationProps {
  title: string;
  subtitle?: string;
  onComplete: () => void;
  durationMs?: number;
}

export function CompletionAnimation({
  title,
  subtitle,
  onComplete,
  durationMs = 4000,
}: CompletionAnimationProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, durationMs - 1000);

    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [onComplete, durationMs]);

  return (
    <AnimatePresence>
      {showConfetti && (
        <div className="fixed inset-0 z-[110] pointer-events-none">
          <Confetti 
            width={width} 
            height={height} 
            recycle={false} 
            numberOfPieces={400}
            gravity={0.15}
          />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Decorative background glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 mix-blend-screen" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative z-10 flex flex-col items-center justify-center p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="mb-6 relative"
          >
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="bg-primary text-primary-foreground h-24 w-24 rounded-full flex items-center justify-center shadow-2xl relative z-10">
              <CheckCircle2 className="size-12" />
            </div>
            
            {/* Sparkles around icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-4 -right-4 text-amber-400"
            >
              <Sparkles className="size-8" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-2 -left-4 text-fuchsia-400"
            >
              <Sparkles className="size-6" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-3"
          >
            {title}
          </motion.h2>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground max-w-md"
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
