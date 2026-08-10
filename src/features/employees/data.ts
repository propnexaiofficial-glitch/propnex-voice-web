import type { CallPreview, SubCompany } from "@/features/employees/types";
import type { CallRecord } from "@/types/call";

export function getCompanyById(id: string): SubCompany | undefined {
  return subCompanies.find((company) => company.id === id);
}

export const subCompanies: SubCompany[] = [
  {
    id: "co-001",
    name: "Orchard Realty Group",
    contactEmail: "admin@orchardrealty.sg",
    contactPhone: "+65 6234 1001",
    creditsUsed: 4280,
    creditsLimit: 8000,
    inboundCalls: 342,
    outboundCalls: 189,
    isPremium: true,
    status: "active",
    joinedDate: "2025-11-12",
  },
  {
    id: "co-002",
    name: "Marina Bay Properties",
    contactEmail: "ops@marinabayprops.com",
    contactPhone: "+65 6345 2002",
    creditsUsed: 2150,
    creditsLimit: 5000,
    inboundCalls: 198,
    outboundCalls: 112,
    isPremium: false,
    status: "active",
    joinedDate: "2026-01-08",
  },
  {
    id: "co-003",
    name: "Luxury Estates SG",
    contactEmail: "premium@luxuryestates.sg",
    contactPhone: "+65 6567 4004",
    creditsUsed: 6100,
    creditsLimit: 12000,
    inboundCalls: 421,
    outboundCalls: 310,
    isPremium: true,
    status: "active",
    joinedDate: "2025-09-05",
  },
];

export const callPreviews: Record<string, CallPreview[]> = {
  "co-001": [
    {
      id: "p1",
      customerNumber: "+65 9123 1111",
      date: "Aug 5, 2:20 PM",
      duration: "3m 12s",
      status: "completed",
      direction: "inbound",
    },
    {
      id: "p2",
      customerNumber: "+65 8234 2222",
      date: "Aug 5, 11:45 AM",
      duration: "1m 48s",
      status: "completed",
      direction: "outbound",
    },
  ],
  "co-002": [
    {
      id: "p3",
      customerNumber: "+65 8456 4444",
      date: "Aug 5, 10:15 AM",
      duration: "4m 05s",
      status: "completed",
      direction: "inbound",
    },
  ],
  "co-003": [
    {
      id: "p4",
      customerNumber: "+65 9789 7777",
      date: "Aug 5, 1:40 PM",
      duration: "6m 22s",
      status: "completed",
      direction: "inbound",
    },
    {
      id: "p5",
      customerNumber: "+65 8890 8888",
      date: "Aug 5, 12:10 PM",
      duration: "3m 55s",
      status: "completed",
      direction: "outbound",
    },
  ],
};

export const companyInboundCalls: Record<string, CallRecord[]> = {
  "co-001": [
    {
      id: "co001-in-1",
      callId: "CL-ORCH-1001",
      callerId: "+65 9123 1111",
      customerNumber: "+65 9123 1111",
      assignedNumber: "+65 6234 1001",
      callDateTime: "2026-08-05T14:20:00",
      duration: "3m 12s",
      durationSeconds: 192,
      status: "completed",
      creditsUsed: 9,
      transcript: [
        { speaker: "agent", text: "Orchard Realty, how may I assist you?", timestamp: "0:00" },
        { speaker: "customer", text: "I'd like to book a viewing for a condo.", timestamp: "0:07" },
      ],
    },
    {
      id: "co001-in-2",
      callId: "CL-ORCH-1002",
      callerId: "+65 8765 4321",
      customerNumber: "+65 8765 4321",
      assignedNumber: "+65 6234 1001",
      callDateTime: "2026-08-04T16:45:00",
      duration: "5m 40s",
      durationSeconds: 340,
      status: "completed",
      creditsUsed: 14,
      transcript: [
        { speaker: "agent", text: "Thank you for calling Orchard Realty Group.", timestamp: "0:00" },
      ],
    },
    {
      id: "co001-in-3",
      callId: "CL-ORCH-1003",
      callerId: "+65 8111 2222",
      customerNumber: "+65 8111 2222",
      assignedNumber: "+65 6234 1001",
      callDateTime: "2026-08-04T11:10:00",
      duration: "0m 52s",
      durationSeconds: 52,
      status: "missed",
      creditsUsed: 2,
      transcript: [],
    },
  ],
  "co-002": [
    {
      id: "co002-in-1",
      callId: "CL-MAR-2001",
      callerId: "+65 8456 4444",
      customerNumber: "+65 8456 4444",
      assignedNumber: "+65 6345 2002",
      callDateTime: "2026-08-05T10:15:00",
      duration: "4m 05s",
      durationSeconds: 245,
      status: "completed",
      creditsUsed: 11,
      transcript: [
        { speaker: "agent", text: "Marina Bay Properties, good morning.", timestamp: "0:00" },
      ],
    },
  ],
  "co-003": [
    {
      id: "co003-in-1",
      callId: "CL-LUX-3001",
      callerId: "+65 9789 7777",
      customerNumber: "+65 9789 7777",
      assignedNumber: "+65 6567 4004",
      callDateTime: "2026-08-05T13:40:00",
      duration: "6m 22s",
      durationSeconds: 382,
      status: "completed",
      creditsUsed: 18,
      transcript: [
        { speaker: "agent", text: "Luxury Estates premium line, how can I help?", timestamp: "0:00" },
      ],
    },
  ],
};

export const companyOutboundCalls: Record<string, CallRecord[]> = {
  "co-001": [
    {
      id: "co001-out-1",
      customerNumber: "+65 8234 2222",
      assignedNumber: "+65 6234 1001",
      callDateTime: "2026-08-05T11:45:00",
      duration: "1m 48s",
      durationSeconds: 108,
      status: "completed",
      creditsUsed: 6,
      transcript: [
        { speaker: "agent", text: "Hi, this is Orchard Realty following up on your inquiry.", timestamp: "0:00" },
      ],
    },
    {
      id: "co001-out-2",
      customerNumber: "+65 7999 8888",
      assignedNumber: "+65 6234 1001",
      callDateTime: "2026-08-04T15:20:00",
      duration: "2m 30s",
      durationSeconds: 150,
      status: "completed",
      creditsUsed: 7,
      transcript: [],
    },
  ],
  "co-002": [
    {
      id: "co002-out-1",
      customerNumber: "+65 7333 5555",
      assignedNumber: "+65 6345 2002",
      callDateTime: "2026-08-05T09:30:00",
      duration: "2m 10s",
      durationSeconds: 130,
      status: "completed",
      creditsUsed: 7,
      transcript: [],
    },
  ],
  "co-003": [
    {
      id: "co003-out-1",
      customerNumber: "+65 8890 8888",
      assignedNumber: "+65 6567 4004",
      callDateTime: "2026-08-05T12:10:00",
      duration: "3m 55s",
      durationSeconds: 235,
      status: "completed",
      creditsUsed: 12,
      transcript: [
        { speaker: "agent", text: "Calling from Luxury Estates regarding your premium listing.", timestamp: "0:00" },
      ],
    },
  ],
};
