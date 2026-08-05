import type {
  BillingHistoryItem,
  BillingSummary,
  CreditPackage,
  TelephonyChannel,
} from "@/features/billing/types";

export const billingSummary: BillingSummary = {
  balance: 12450,
  usedThisMonth: 3240,
  monthlyLimit: 15000,
};

export const creditPackages: CreditPackage[] = [
  { id: "pkg-1", credits: 1000, price: 49, currency: "SGD" },
  { id: "pkg-2", credits: 5000, price: 199, currency: "SGD", popular: true },
  {
    id: "pkg-3",
    credits: 15000,
    price: 499,
    currency: "SGD",
    premium: true,
  },
  { id: "pkg-4", credits: 50000, price: 1499, currency: "SGD", premium: true },
];

export const telephonyChannels: TelephonyChannel[] = [
  {
    id: "ch-1",
    number: "+65 6789 0101",
    label: "Main Inbound Line",
    type: "inbound",
    status: "active",
    provider: "Twilio",
  },
  {
    id: "ch-2",
    number: "+65 6789 0201",
    label: "Outbound Campaign",
    type: "outbound",
    status: "active",
    provider: "Twilio",
  },
  {
    id: "ch-3",
    number: "+65 6789 0301",
    label: "Premium Support Line",
    type: "both",
    status: "active",
    provider: "Plivo",
    isPremium: true,
  },
  {
    id: "ch-4",
    number: "+65 6789 0401",
    label: "Backup SIP Channel",
    type: "both",
    status: "inactive",
    provider: "SIP Trunk",
  },
  {
    id: "ch-5",
    number: "+65 6789 0501",
    label: "New Channel (Pending)",
    type: "inbound",
    status: "pending",
    provider: "Twilio",
  },
];

export const billingHistory: BillingHistoryItem[] = [
  {
    id: "bh-1",
    date: "2026-08-05T10:30:00",
    description: "Credit Top-Up — 5,000 credits",
    type: "top-up",
    credits: 5000,
    amount: 199,
    status: "completed",
  },
  {
    id: "bh-2",
    date: "2026-08-04T18:00:00",
    description: "Voice AI Usage — August",
    type: "usage",
    credits: -840,
    amount: 0,
    status: "completed",
  },
  {
    id: "bh-3",
    date: "2026-08-01T09:00:00",
    description: "Premium Plan Renewal",
    type: "subscription",
    credits: 0,
    amount: 499,
    status: "completed",
  },
  {
    id: "bh-4",
    date: "2026-07-28T14:20:00",
    description: "Credit Top-Up — 1,000 credits",
    type: "top-up",
    credits: 1000,
    amount: 49,
    status: "completed",
  },
  {
    id: "bh-5",
    date: "2026-07-25T11:00:00",
    description: "Outbound Campaign Usage",
    type: "usage",
    credits: -620,
    amount: 0,
    status: "completed",
  },
  {
    id: "bh-6",
    date: "2026-07-20T16:45:00",
    description: "Credit Top-Up — 15,000 credits",
    type: "top-up",
    credits: 15000,
    amount: 499,
    status: "completed",
  },
  {
    id: "bh-7",
    date: "2026-07-18T08:30:00",
    description: "Payment Processing",
    type: "top-up",
    credits: 5000,
    amount: 199,
    status: "pending",
  },
  {
    id: "bh-8",
    date: "2026-07-15T12:00:00",
    description: "Failed Top-Up Attempt",
    type: "top-up",
    credits: 0,
    amount: 49,
    status: "failed",
  },
];
