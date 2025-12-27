import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Support for soft delete and restore
    if (body.deleted !== undefined) {
      const updateData: any = {
        deleted: body.deleted,
        deletedAt: body.deleted ? new Date() : null,
      };

      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Trigger incremental sync to Google Sheets
      const syncUrl = new URL("/api/sync/incremental", req.url);
      fetch(syncUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: "users",
          recordId: id,
          sheetName: "Users",
        }),
      }).catch((err) => console.error("Sync failed:", err));

      return NextResponse.json({
        success: true,
        message: body.deleted ? "User deleted successfully" : "User restored successfully",
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
