"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { quickActions } from "@/features/home/data";
import { cn } from "@/lib/utils";

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
                className="group glass-card flex h-full flex-col overflow-hidden rounded-xl transition-all hover:border-primary/25 hover:shadow-[0_0_28px_rgba(124,58,237,0.12)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-border">
                  <Image
                    src={action.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
                    className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-[#050508]/40 to-[#7c3aed]/10" />
                  <div className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-lg bg-primary/90 text-white shadow-[var(--glow-purple)]">
                    <Icon className="size-4" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="text-sm font-medium text-white/95">
                      {action.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary/80 transition-colors group-hover:text-primary">
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
