"use client";

import { useState, useEffect } from "react";
import { Lock, Bell, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import type { SubCompany } from "@/features/employees/types";
import { cn } from "@/lib/utils";

type PendingCompanyViewProps = {
  company: SubCompany;
};

const COOLDOWN_HOURS = 24;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

export function PendingCompanyView({ company }: PendingCompanyViewProps) {
  const [canRemind, setCanRemind] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const storageKey = `subcompany_reminder_sent_${company.id}`;

  useEffect(() => {
    const checkCooldown = () => {
      const lastSentStr = localStorage.getItem(storageKey);
      if (!lastSentStr) {
        setCanRemind(true);
        setTimeRemaining(null);
        return;
      }

      const lastSent = parseInt(lastSentStr, 10);
      const now = Date.now();
      const elapsed = now - lastSent;

      if (elapsed >= COOLDOWN_MS) {
        setCanRemind(true);
        setTimeRemaining(null);
      } else {
        setCanRemind(false);
        const remainingMs = COOLDOWN_MS - elapsed;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 60000);
    return () => clearInterval(interval);
  }, [storageKey]);

  const handleSendReminder = async () => {
    setSending(true);
    setReminderMessage(null);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};

      // Hit the admin panel's number-requests API.
      // The backend deduplicates: if a notification already exists it only
      // updates the timestamp and sends the email — it does NOT create a new record.
      const adminBase =
        process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.propnexai.com";

      const res = await fetch(`${adminBase}/api/number-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || "",
          companyId: company.id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
        }),
      });

      if (res.ok || res.status === 200) {
        // Lock locally for 24h
        localStorage.setItem(storageKey, Date.now().toString());
        setCanRemind(false);
        setTimeRemaining("24h 0m");
        setReminderMessage("Reminder sent! The admin has been notified by email.");
      } else if (res.status === 429) {
        // Backend 24h lock
        localStorage.setItem(storageKey, Date.now().toString());
        setCanRemind(false);
        setReminderMessage("You can only send a reminder once every 24 hours.");
      } else {
        setReminderMessage("Failed to send reminder. Please try again.");
      }
    } catch (e) {
      setReminderMessage("Failed to send reminder. Please check your connection.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card flex max-w-md flex-col items-center justify-center gap-6 p-10 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
          <Lock className="size-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Pending Admin Verification
          </h2>
          <p className="text-sm text-muted-foreground">
            The sub-company <strong>{company.name}</strong> has been created
            successfully, but it is currently blocked. An admin must assign a
            dedicated phone number and verify this tenant before you can access
            its dashboard.
          </p>
        </div>

        <div className="w-full space-y-4 pt-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">What happens next?</p>
              <p className="text-xs text-muted-foreground">
                Once approved, this block will automatically disappear.
              </p>
            </div>
          </div>

          {reminderMessage && (
            <p className="text-sm text-center text-muted-foreground px-1">
              {reminderMessage}
            </p>
          )}

          <Button
            size="lg"
            className={cn("w-full transition-all", !canRemind && "opacity-80")}
            disabled={!canRemind || sending}
            onClick={handleSendReminder}
          >
            {sending ? (
              <>
                <Clock className="mr-2 size-4 animate-pulse" />
                Sending...
              </>
            ) : canRemind ? (
              <>
                <Bell className="mr-2 size-4" />
                Send Reminder to Admin
              </>
            ) : (
              <>
                <Clock className="mr-2 size-4" />
                Reminder sent (Available in {timeRemaining})
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
