export type CallStatus = "completed" | "missed" | "failed";

export type CallDirection = "inbound" | "outbound";

export type TranscriptLine = {
  speaker: "agent" | "customer";
  text: string;
  timestamp: string;
};

export type CallRecord = {
  id: string;
  callId?: string;
  callerId?: string;
  customerNumber: string;
  assignedNumber: string;
  callDateTime: string;
  duration: string;
  durationSeconds: number;
  status: CallStatus;
  creditsUsed: number;
  recordingUrl?: string;
  transcript: TranscriptLine[];
};

export type CallLogFilters = {
  search: string;
  status: CallStatus | "all";
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_CALL_FILTERS: CallLogFilters = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export const CALL_STATUS_OPTIONS: { value: CallStatus | "all"; label: string }[] =
  [
    { value: "all", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "missed", label: "Missed" },
    { value: "failed", label: "Failed" },
  ];
