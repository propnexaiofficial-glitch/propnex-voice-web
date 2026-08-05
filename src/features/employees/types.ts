export type SubCompany = {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  creditsUsed: number;
  creditsLimit: number;
  inboundCalls: number;
  outboundCalls: number;
  isPremium: boolean;
  status: "active" | "inactive";
  joinedDate: string;
};

export type CallPreview = {
  id: string;
  customerNumber: string;
  date: string;
  duration: string;
  status: "completed" | "missed" | "failed";
  direction: "inbound" | "outbound";
};

export type AddCompanyForm = {
  name: string;
  contactEmail: string;
  contactPhone: string;
};
