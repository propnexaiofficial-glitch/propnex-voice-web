import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  // Always return empty array for now to prevent crashes and ensure fast load
  return NextResponse.json([]);
}
