import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    inboundCalls: 0,
    outboundCalls: 0,
    activeAgents: 0,
    creditsUsed: 0
  });
}
