"use client";

import { Building2, Mail, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type ProfileCardProps = {
  className?: string;
};

export function ProfileCard({ className }: ProfileCardProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {}
    };

    fetchUser();
    // Optional: listen to custom events if user data changes, but polling or just initial load is usually fine here
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, []);

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Loading...";
  const email = user?.email || "loading...";
  const phone = user?.phone || "loading...";
  const assignedNumber = user?.assignedNumber || "Not Assigned";
  const company = user?.companyId ? "PropNex AI Technology" : "No Company"; // We don't have the company name in the JWT payload easily, so placeholder for now

  const profileFields = [
    { label: "Email", value: email, icon: Mail },
    { label: "Phone", value: phone, icon: Phone },
    { label: "Company", value: company, icon: Building2 },
    { label: "Assigned Number", value: assignedNumber, icon: Phone },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("glass-card rounded-2xl p-6", className)}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-full bg-muted blur-md" />
          <Avatar className="relative size-20 border-2 border-border">
            <AvatarFallback className="bg-muted text-lg text-foreground">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                {fullName}
              </h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Account owner · {company}
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
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="break-all text-sm font-medium">{field.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
