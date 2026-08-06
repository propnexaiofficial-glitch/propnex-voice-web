export type CreditPackage = {
  id: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  premium?: boolean;
};

export type AssignedChannel = {
  id: string;
  didNo: string;
  channelCount: number;
  purchasedChannels: string[];
};

export type BillingHistoryItem = {
  id: string;
  date: string;
  description: string;
  type: "top-up" | "usage" | "subscription";
  credits: number;
  amount: number;
  status: "completed" | "pending" | "failed";
};

export type BillingSummary = {
  balance: number;
  usedThisMonth: number;
  monthlyLimit: number;
};
