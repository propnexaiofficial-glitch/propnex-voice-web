import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  });
}
