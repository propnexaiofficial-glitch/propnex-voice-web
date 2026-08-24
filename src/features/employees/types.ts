export type SubCompany = {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  assignedNumbers: string[]; // all phone numbers assigned to this sub-company
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  inboundCalls: number;
  outboundCalls: number;
  isPremium: boolean;
  status: "active" | "inactive" | "pending";
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
  allocatedCredits: number;
};
