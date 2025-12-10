import { connectToDatabase } from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET endpoint to download payment proof files from GridFS
 * Usage: /api/payments/proof/[fileId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    // Validate fileId
    if (!fileId || !ObjectId.isValid(fileId)) {
      return NextResponse.json(
        { error: "Invalid file ID" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bucket = new GridFSBucket(db, { bucketName: "payment-proofs" });

    // Check if file exists
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    if (files.length === 0) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      );
    }

    const file = files[0];

    // Stream the file
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${file.filename || 'payment-proof'}"`,
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("[Payment Proof] Download error:", error);
    return NextResponse.json(
      { error: "Failed to download payment proof" },
      { status: 500 }
    );
  }
}
