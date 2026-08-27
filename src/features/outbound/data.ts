import type { CallRecord } from "@/types/call";

import type { Campaign } from "@/features/outbound/types";

export const outboundCalls: CallRecord[] = [
  {
    id: "out-001",
    customerNumber: "+65 9012 3456",
    assignedNumber: "+65 6789 0201",
    callDateTime: "2026-08-05T15:10:00",
    duration: "3m 20s",
    durationSeconds: 200,
    status: "completed",
    creditsUsed: 12.25,
    transcript: [
      { speaker: "agent", text: "Hello, this is PropNex AI calling about your property inquiry.", timestamp: "0:00" },
      { speaker: "customer", text: "Yes, I'm still interested in the listing.", timestamp: "0:08" },
    ],
  },
  {
    id: "out-002",
    customerNumber: "+65 8123 4567",
    assignedNumber: "+65 6789 0201",
    callDateTime: "2026-08-05T14:30:00",
    duration: "1m 45s",
    durationSeconds: 105,
    status: "completed",
    creditsUsed: 7,
    transcript: [
      { speaker: "agent", text: "Hi, following up on your viewing request.", timestamp: "0:00" },
    ],
  },
  {
    id: "out-003",
    customerNumber: "+65 9234 5678",
    assignedNumber: "+65 6789 0202",
    callDateTime: "2026-08-05T13:00:00",
    duration: "0m 00s",
    durationSeconds: 0,
    status: "missed",
    creditsUsed: 0,
    transcript: [],
  },
  {
    id: "out-004",
    customerNumber: "+65 8345 6789",
    assignedNumber: "+65 6789 0201",
    callDateTime: "2026-08-05T11:20:00",
    duration: "5m 12s",
    durationSeconds: 312,
    status: "completed",
    creditsUsed: 19.25,
    transcript: [
      { speaker: "customer", text: "Tell me more about the financing options.", timestamp: "0:00" },
      { speaker: "agent", text: "I'd be happy to explain our partner bank rates.", timestamp: "0:06" },
    ],
  },
  {
    id: "out-005",
    customerNumber: "+65 9456 7890",
    assignedNumber: "+65 6789 0202",
    callDateTime: "2026-08-04T16:50:00",
    duration: "2m 05s",
    durationSeconds: 125,
    status: "failed",
    creditsUsed: 8.75,
    transcript: [],
  },
  {
    id: "out-006",
    customerNumber: "+65 8567 8901",
    assignedNumber: "+65 6789 0201",
    callDateTime: "2026-08-04T14:15:00",
    duration: "4m 38s",
    durationSeconds: 278,
    status: "completed",
    creditsUsed: 17.5,
    transcript: [
      { speaker: "agent", text: "Calling to re-engage on your property search.", timestamp: "0:00" },
    ],
  },
  {
    id: "out-007",
    customerNumber: "+65 9678 9012",
    assignedNumber: "+65 6789 0202",
    callDateTime: "2026-08-04T10:40:00",
    duration: "3m 55s",
    durationSeconds: 235,
    status: "completed",
    creditsUsed: 14,
    transcript: [
      { speaker: "customer", text: "Can we schedule a call with an agent?", timestamp: "0:00" },
    ],
  },
  {
    id: "out-008",
    customerNumber: "+65 8789 0123",
    assignedNumber: "+65 6789 0201",
    callDateTime: "2026-08-03T17:05:00",
    duration: "0m 35s",
    durationSeconds: 35,
    status: "missed",
    creditsUsed: 3.5,
    transcript: [],
  },
  {
    id: "out-009",
    customerNumber: "+65 9890 1234",
    assignedNumber: "+65 6789 0202",
    callDateTime: "2026-08-03T12:30:00",
    duration: "6m 22s",
    durationSeconds: 382,
    status: "completed",
    creditsUsed: 22.75,
    transcript: [
      { speaker: "agent", text: "Lead reactivation call for dormant inquiry.", timestamp: "0:00" },
    ],
  },
  {
    id: "out-010",
    customerNumber: "+65 8901 2345",
    assignedNumber: "+65 6789 0201",
    callDateTime: "2026-08-02T15:45:00",
    duration: "2m 48s",
    durationSeconds: 168,
    status: "completed",
    creditsUsed: 10.5,
    transcript: [
      { speaker: "customer", text: "What's the price for the Tampines unit?", timestamp: "0:00" },
    ],
  },
  {
    id: "out-011",
    customerNumber: "+65 9012 5678",
    assignedNumber: "+65 6789 0202",
    callDateTime: "2026-08-02T09:20:00",
    duration: "1m 30s",
    durationSeconds: 90,
    status: "failed",
    creditsUsed: 5.25,
    transcript: [],
  },
  {
    id: "out-012",
    customerNumber: "+65 8123 6789",
    assignedNumber: "+65 6789 0201",
    callDateTime: "2026-08-01T14:00:00",
    duration: "4m 05s",
    durationSeconds: 245,
    status: "completed",
    creditsUsed: 15.75,
    transcript: [
      { speaker: "agent", text: "Outbound follow-up on your condo viewing.", timestamp: "0:00" },
    ],
  },
];

export const leadReactivationCampaign: Campaign = {
  id: "camp-001",
  name: "Lead Reactivation Q3",
  status: "idle",
  totalContacts: 0,
  completedCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  comingSoon: false,
};

export const outboundCampaignInitial: Campaign = {
  id: "camp-002",
  name: "Outbound",
  status: "idle",
  totalContacts: 0,
  completedCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
};

/** @deprecated Use leadReactivationCampaign */
export const initialCampaign = leadReactivationCampaign;

export const OUTBOUND_PAGE_SIZE = 8;

export const MOCK_CSV_CONTACT_COUNT = 150;
