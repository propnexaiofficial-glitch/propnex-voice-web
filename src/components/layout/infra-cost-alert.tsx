"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export function InfraCostAlert() {
  const [alert, setAlert] = useState<{ active: boolean; message?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch("/api/infra-cost-notification", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setAlert(data))
      .catch(() => setAlert(null));
  }, []);

  if (!alert?.active || !alert.message) return null;

  return (
    <div className="px-4 py-3 border-t border-border">
      <div className="relative w-full rounded-lg border px-4 py-3 text-sm border-amber-500/20 bg-amber-500/10 text-amber-500 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <h5 className="font-semibold leading-none tracking-tight">Payment Reminder</h5>
        </div>
        <div className="text-xs opacity-90 leading-relaxed ml-6 mt-1">
          {alert.message}
        </div>
      </div>
    </div>
  );
}
