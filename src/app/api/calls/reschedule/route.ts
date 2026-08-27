import { NextRequest, NextResponse } from "next/server";

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";

/**
 * POST /api/calls/reschedule
 * Proxies the reschedule request to the backend NestJS server which
 * queues each failed lead into the BullMQ delayed-calls queue at the
 * specified future date/time.
 *
 * Body: { campaignId, leads, scheduledAt, didNumber }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, leads, scheduledAt, didNumber } = body;

    if (!campaignId || !leads || !Array.isArray(leads) || !scheduledAt || !didNumber) {
      return NextResponse.json(
        { error: "Missing required fields: campaignId, leads, scheduledAt, didNumber" },
        { status: 400 }
      );
    }

    // Forward to the backend NestJS controller: POST /api/calls/reschedule
    const backendUrl = `${BACKEND_API}/api/calls/reschedule`;

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ campaignId, leads, scheduledAt, didNumber }),
    });

    if (!backendRes.ok) {
      const errData = await backendRes.json().catch(() => ({ error: "Backend error" }));
      return NextResponse.json(
        { error: errData.error || "Failed to schedule reactivation calls" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[/api/calls/reschedule] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
