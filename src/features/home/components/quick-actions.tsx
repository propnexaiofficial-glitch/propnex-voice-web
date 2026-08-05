"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { quickActions } from "@/features/home/data";
import { cn } from "@/lib/utils";

const accentStyles = {
  purple: "from-primary/80 to-violet-600/60",
  blue: "from-blue-600/80 to-cyan-500/60",
  green: "from-emerald-600/80 to-teal-500/60",
  gold: "from-gold/80 to-amber-500/60",
};

const iconStyles = {
  purple: "bg-primary/90 text-white",
  blue: "bg-blue-500/90 text-white",
  green: "bg-emerald-500/90 text-white",
  gold: "bg-gold/90 text-navy",
};

type QuickActionsProps = {
  className?: string;
};

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">
          Jump to common tasks across your dashboard
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {quickActions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Link
                href={action.href}
                className="group glass-card flex h-full flex-col overflow-hidden rounded-2xl transition-all hover:border-primary/30 hover:shadow-[var(--glow-purple)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={action.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-t via-black/20 to-black/70",
                      accentStyles[action.accent]
                    )}
                  />
                  <div
                    className={cn(
                      "absolute left-3 top-3 flex size-9 items-center justify-center rounded-lg shadow-lg backdrop-blur-sm",
                      iconStyles[action.accent]
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="text-sm font-semibold text-white drop-shadow-sm">
                      {action.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
