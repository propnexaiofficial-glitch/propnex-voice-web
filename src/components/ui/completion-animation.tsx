"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CalendarClock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface CompletionAnimationProps {
  title: string;
  subtitle?: string;
  onComplete: () => void;
  durationMs?: number;
  type?: "campaign" | "schedule";
}

// Animated SVG checkmark that draws itself
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 52 52" className="size-14" fill="none" stroke="currentColor">
      <motion.circle
        cx="26" cy="26" r="25"
        strokeWidth="2"
        className="text-white/30"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M14 27 L22 35 L38 19"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

// Animated clock hands for schedule type
function AnimatedClock() {
  return (
    <svg viewBox="0 0 52 52" className="size-14" fill="none" stroke="currentColor">
      <motion.circle
        cx="26" cy="26" r="23"
        strokeWidth="2"
        className="text-white/40"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      {/* Hour ticks */}
      {[0,1,2,3,4,5,6,7,8,9,10,11].map((i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r1 = 18, r2 = 21;
        return (
          <motion.line
            key={i}
            x1={26 + r1 * Math.cos(angle)} y1={26 + r1 * Math.sin(angle)}
            x2={26 + r2 * Math.cos(angle)} y2={26 + r2 * Math.sin(angle)}
            strokeWidth="1.5"
            className="text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.04 }}
          />
        );
      })}
      {/* Hour hand pointing to ~10 */}
      <motion.line
        x1="26" y1="26" x2="18" y2="17"
        strokeWidth="2.5" strokeLinecap="round"
        className="text-white"
        initial={{ rotate: 0, originX: "26px", originY: "26px", opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      />
      {/* Minute hand pointing to ~2 */}
      <motion.line
        x1="26" y1="26" x2="34" y2="18"
        strokeWidth="2" strokeLinecap="round"
        className="text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      />
      {/* Center dot */}
      <motion.circle
        cx="26" cy="26" r="2"
        fill="currentColor"
        className="text-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.1, type: "spring" }}
      />
    </svg>
  );
}

// Floating orb
function Orb({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full blur-[80px] opacity-0 pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color }}
      animate={{ opacity: [0, 0.5, 0.3, 0.5], scale: [0.8, 1.1, 0.95, 1.1] }}
      transition={{ delay, duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  );
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
  const duration = durationMs ?? (type === "campaign" ? 4500 : 3500);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const confettiTimer = type === "campaign"
      ? setTimeout(() => setShowConfetti(false), duration - 1200)
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

  // Color theme per type
  const glowColor  = isCampaign ? "rgba(99,102,241,0.6)"  : "rgba(20,184,166,0.6)";
  const glowColor2 = isCampaign ? "rgba(168,85,247,0.4)"  : "rgba(59,130,246,0.4)";
  const ringClass  = isCampaign
    ? "from-violet-500 via-purple-500 to-indigo-500"
    : "from-teal-400 via-cyan-400 to-blue-500";
  const iconBg     = isCampaign
    ? "from-violet-600 to-indigo-600"
    : "from-teal-500 to-blue-600";

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Confetti — campaign only */}
          {showConfetti && type === "campaign" && (
            <div className="fixed inset-0 z-[120] pointer-events-none">
              <Confetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.12}
                colors={["#818cf8", "#a78bfa", "#c084fc", "#f472b6", "#facc15", "#34d399"]}
              />
            </div>
          )}

          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="fixed inset-0 z-[110] flex items-center justify-center"
            style={{ backdropFilter: "blur(20px)", background: "rgba(0,0,0,0.75)" }}
          >
            {/* Animated background orbs */}
            <Orb color={glowColor}  size={500} x="10%"  y="5%"  delay={0} />
            <Orb color={glowColor2} size={400} x="60%"  y="55%" delay={0.3} />
            <Orb color={glowColor}  size={300} x="70%"  y="5%"  delay={0.6} />

            {/* Subtle grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }}
            />

            {/* Card */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -30, transition: { duration: 0.5 } }}
              transition={{ type: "spring", damping: 18, stiffness: 120, delay: 0.1 }}
              className="relative z-10 flex flex-col items-center gap-8 px-12 py-14 text-center max-w-md"
            >
              {/* Glowing ring + Icon */}
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 14, stiffness: 120 }}
              >
                {/* Outer pulse ring */}
                <motion.div
                  className={`absolute -inset-3 rounded-full bg-gradient-to-br ${ringClass} opacity-30 blur-xl`}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Ring border */}
                <motion.div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-br ${ringClass} opacity-60`}
                  style={{ padding: 2 }}
                />
                {/* Icon circle */}
                <div className={`relative size-28 rounded-full bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-2xl z-10`}>
                  {isCampaign ? <AnimatedCheck /> : <AnimatedClock />}
                </div>

                {/* Sparkle particles radiating out */}
                {[0,1,2,3,4,5].map((i) => {
                  const angle = (i * 60) * (Math.PI / 180);
                  return (
                    <motion.div
                      key={i}
                      className={`absolute size-2 rounded-full bg-gradient-to-br ${ringClass}`}
                      style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos(angle) * 80,
                        y: Math.sin(angle) * 80,
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 1, ease: "easeOut" }}
                    />
                  );
                })}
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="space-y-3"
              >
                <h2
                  className="text-4xl font-bold tracking-tight text-white"
                  style={{ textShadow: `0 0 40px ${isCampaign ? "rgba(139,92,246,0.8)" : "rgba(20,184,166,0.8)"}` }}
                >
                  {title}
                </h2>

                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-base text-white/60 leading-relaxed"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </motion.div>

              {/* Auto-dismiss progress bar */}
              <motion.div className="w-full h-0.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${ringClass}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000 - 0.5, ease: "linear", delay: 0.3 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
