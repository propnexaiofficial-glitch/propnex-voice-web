"use client";

import { Building2, Mail, Phone, User } from "lucide-react";
import { motion } from "framer-motion";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockUser } from "@/data/mock-user";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const profileFields = [
  { label: "Email", value: mockUser.email, icon: Mail },
  { label: "Phone", value: mockUser.phone, icon: Phone },
  { label: "Company", value: mockUser.company, icon: Building2 },
];

type ProfileCardProps = {
  className?: string;
};

export function ProfileCard({ className }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("glass-card rounded-2xl p-6", className)}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-full bg-primary/20 blur-md" />
          <Avatar className="relative size-20 border-2 border-primary/25">
            <AvatarFallback className="bg-primary/15 text-lg text-primary">
              {getInitials(mockUser.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                {mockUser.name}
              </h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Account owner · PropNex AI Technology
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {profileFields.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="truncate text-sm font-medium">{field.value}</p>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Account Type
                </p>
                <p className="text-sm font-medium">
                  Enterprise · Multi-tenant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
