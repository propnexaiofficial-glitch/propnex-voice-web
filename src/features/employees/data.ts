import type { CallPreview, SubCompany } from "@/features/employees/types";

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
