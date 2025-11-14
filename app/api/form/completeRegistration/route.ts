import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { connectToDatabase } from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { fetchUserData } from "@/app/utils/GetUpdateUser";

export async function POST(req: NextRequest) {
  try {
    const email = getEmailFromToken(req);
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token or email not found" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection: Collection = db.collection("users");

    const userResponse = await fetchUserData("email", email, ["_id", "email"]);
    console.log("fetchUserData result:", JSON.stringify(userResponse));

    if (!userResponse.success || !userResponse.data) {
      return NextResponse.json(
        { success: false, message: "User not found or invalid response" },
        { status: 404 }
      );
    }

    const rawId = userResponse.data._id;
    let query: any = null;

    let idStr = "";
    if (!rawId) {
      idStr = "";
    } else if (typeof rawId === "string") {
      idStr = rawId;
    } else if ("$oid" in (rawId as any) && typeof (rawId as any).$oid === "string") {
      idStr = (rawId as any).$oid;
    } else if ("_id" in (rawId as any) && typeof (rawId as any)._id === "string") {
      idStr = (rawId as any)._id;
    } else {
      try {
        idStr = String(rawId);
      } catch {
        idStr = "";
      }
    }

    if (idStr) {
      try {
        query = { _id: new ObjectId(idStr) };
      } catch (err) {
        console.warn("Could not convert idStr to ObjectId, falling back to email. idStr:", idStr, err);
        query = { email };
      }
    } else {
      query = { email };
    }

    const update = { $set: { registrationDone: true, updatedAt: new Date() } };

    // perform primary update
    const result = await usersCollection.findOneAndUpdate(query, update, { returnDocument: "after" });
    // normalize result: some drivers return { value: doc } others return doc directly
    const updatedDoc = (result && (result as any).value) ? (result as any).value : result;

    console.log("Primary update normalized:", !!updatedDoc, updatedDoc);

    if (!updatedDoc || !((updatedDoc as any)._id || (updatedDoc as any).email)) {
      console.warn("Primary update did not match a document. Attempting fallback update by email.");
      const fallbackRaw = await usersCollection.findOneAndUpdate({ email }, update, { returnDocument: "after" });
      const fallback = (fallbackRaw && (fallbackRaw as any).value) ? (fallbackRaw as any).value : fallbackRaw;
      console.log("Fallback update normalized:", !!fallback, fallback);
      if (!fallback || !((fallback as any)._id || (fallback as any).email)) {
        return NextResponse.json(
          { success: false, message: "Failed to update registration status" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: true, message: "Registration completed (fallback)", data: fallback },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration completed successfully",
        data: updatedDoc,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in completeRegistration:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}