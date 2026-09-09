import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Received Bonvoice Hangup Webhook:", data);

    // Bonvoice Hangup JSON Payload usually contains:
    // SourceNumber, DestinationNumber, StartTime, DataSource, callType, callDuration,
    // recordDuration, billableDuration, cost, resource_url, etc.

    const {
      SourceNumber,
      DestinationNumber,
      StartTime,
      callDuration,
      cost,
      resource_url,
      reference_id // If we passed this in the outbound request
    } = data;

    // Find the corresponding CallLog
    let callLog;
    
    if (reference_id) {
      callLog = await prisma.callLog.findUnique({ where: { id: reference_id } });
    }

    // If no reference_id (like in inbound calls), find by DestinationNumber (DID) or SourceNumber
    if (!callLog && SourceNumber) {
      // Find the active inbound phone number matching the DID
      const phoneNumber = await prisma.phoneNumber.findFirst({
        where: { number: DestinationNumber, direction: "INBOUND" }
      });

      if (phoneNumber) {
        // Create a new inbound call log
        callLog = await prisma.callLog.create({
          data: {
            resourceKey: `CL${Date.now()}`,
            publicId: `public-CL${Date.now()}`,
            direction: "INBOUND",
            status: "COMPLETED",
            companyId: phoneNumber.companyId,
            phoneNumberId: phoneNumber.id,
            agentId: phoneNumber.inboundAgentId,
            // Additional details can be mapped as needed
          } as any,
        });
      }
    }

    if (callLog) {
      // Update call log with hangup details
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: "COMPLETED",
          duration: callDuration ? parseInt(callDuration) : 0,
          cost: cost ? parseFloat(cost) : 0,
          recordingUrl: resource_url || null,
          endedAt: new Date(),
        } as any,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bonvoice Hangup Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
