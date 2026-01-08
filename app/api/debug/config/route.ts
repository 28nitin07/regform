import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * GET /api/debug/config
 * 
 * Shows current environment configuration (for debugging)
 * Only accessible by authenticated admin users
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Only show config to admin users
    const adminEmails = process.env.NEXTAUTH_ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const config = {
      environment: process.env.NODE_ENV,
      googleSheets: {
        sheetId: process.env.GOOGLE_SHEET_ID,
        sheetIdLength: process.env.GOOGLE_SHEET_ID?.length || 0,
        sheetIdPrefix: process.env.GOOGLE_SHEET_ID?.substring(0, 10) + "...",
        serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
        syncEnabled: process.env.SHEETS_SYNC_ENABLED,
      },
      database: {
        hasMongoUri: !!process.env.MONGODB_URI,
        dbName: process.env.DB_NAME,
      },
      auth: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      config,
      message: "Configuration loaded successfully",
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
