const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export type ApiResponse<T> = {
  data: T;
  error?: string;
};

export type InboundCallApiItem = {
  id: string;
  publicId: string;
  callLogId: string;
  direction: "INBOUND" | "OUTBOUND";
  status: string;
  provider: string;
  companyId: string;
  phoneNumberId: string | null;
  aiAgentId: string | null;
  campaignId: string | null;
  correlationId: string | null;
  providerCallId: string | null;
  providerStatus: string | null;
  durationSeconds: number;
  recordingUrl: string | null;
  transcriptUrl: string | null;
  disconnectReason: string | null;
  answeredAt: string | null;
  endedAt: string | null;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CallListApiResponse = {
  data: InboundCallApiItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CallListParams = {
  direction?: "INBOUND" | "OUTBOUND";
  status?: string;
  companyId?: string;
  phoneNumberId?: string;
  provider?: string;
  page?: number;
  limit?: number;
};

export async function fetchInboundCalls(
  params: CallListParams = {}
): Promise<CallListApiResponse> {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.set("status", params.status.toUpperCase());
  if (params.companyId) query.set("companyId", params.companyId);
  if (params.phoneNumberId) query.set("phoneNumberId", params.phoneNumberId);
  if (params.provider) query.set("provider", params.provider);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${API_BASE_URL}/api/calls/inbound${query.toString() ? `?${query}` : ""}`;

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Inbound calls API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<CallListApiResponse>;
}
