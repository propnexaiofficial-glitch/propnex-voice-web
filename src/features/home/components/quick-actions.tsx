"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { quickActions } from "@/features/home/data";
import { cn } from "@/lib/utils";

const accentStyles = {
  purple: "bg-muted text-foreground",
  blue: "bg-muted text-foreground",
  green: "bg-muted text-foreground",
  gold: "bg-muted text-foreground",
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                className="group glass-card flex h-full flex-col rounded-lg p-4 transition-all hover:border-border hover:bg-accent/30"
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    accentStyles[action.accent]
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <h3 className="mt-3 text-sm font-medium">{action.title}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {action.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  Open
                  <ArrowRight className="size-3" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
