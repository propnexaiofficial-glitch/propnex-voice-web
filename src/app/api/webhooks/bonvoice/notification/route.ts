import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Received Bonvoice Call Notification Webhook:", data);

    // Call Notification JSON Payload for Live Statuses
    const {
      reference_id,
      callType, // 0: Init, 1: Answered, 2: Ringing, 3: Completed, etc. (Depending on exact API)
      SourceNumber,
      DestinationNumber,
      status // e.g. "RINGING", "ANSWERED", "BUSY", "FAILED"
    } = data;

    // We use either the explicit status text or infer from callType
    let mappedStatus: "RINGING" | "ANSWERED" | "BUSY" | "FAILED" | "QUEUED" | undefined;
    
    if (status) {
      mappedStatus = status.toUpperCase() as any;
    } else if (callType !== undefined) {
      // Map Bonvoice callType integers to Prisma CallStatus if status text is missing
      switch (parseInt(callType)) {
        case 0: mappedStatus = "QUEUED"; break;
        case 1: mappedStatus = "ANSWERED"; break;
        case 2: mappedStatus = "RINGING"; break;
      }
    }

    if (mappedStatus && reference_id) {
      // Update existing outbound call log
      await prisma.callLog.update({
        where: { id: reference_id },
        data: { status: mappedStatus } as any,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bonvoice Notification Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
