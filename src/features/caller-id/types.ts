export type CallerIdType = "inbound" | "outbound" | "both";

export type CallerIdVerification = "verified" | "pending" | "failed";

export type CallerIdRecord = {
  id: string;
  label: string;
  phoneNumber: string;
  region: string;
  type: CallerIdType;
  verification: CallerIdVerification;
  isDefault: boolean;
  assignedTo?: string;
  addedAt: string;
};

export type CallerIdFilters = {
  search: string;
  type: "all" | CallerIdType;
  verification: "all" | CallerIdVerification;
};

export const DEFAULT_CALLER_ID_FILTERS: CallerIdFilters = {
  search: "",
  type: "all",
  verification: "all",
};

export type AddCallerIdForm = {
  label: string;
  phoneNumber: string;
  region: string;
  type: CallerIdType;
};
