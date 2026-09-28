import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.filename;
    
    // The files are physically stored in public/uploads by the admin panel
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type
    let contentType = "image/png";
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (lowerName.endsWith(".svg")) contentType = "image/svg+xml";
    else if (lowerName.endsWith(".gif")) contentType = "image/gif";
    else if (lowerName.endsWith(".ico")) contentType = "image/x-icon";
    else if (lowerName.endsWith(".webp")) contentType = "image/webp";
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
