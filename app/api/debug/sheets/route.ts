import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

/**
 * GET /api/debug/sheets
 * 
 * Test Google Sheets connectivity and permissions
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

    // Only show debug info to admin users
    const adminEmails = process.env.NEXTAUTH_ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY;

    const result = {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      config: {
        spreadsheetId: spreadsheetId ? `${spreadsheetId.substring(0, 10)}...${spreadsheetId.substring(spreadsheetId.length - 5)}` : "NOT SET",
        fullSpreadsheetId: spreadsheetId, // For debugging - remove in production
        serviceEmail,
        hasPrivateKey,
        privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
        syncEnabled: process.env.SHEETS_SYNC_ENABLED,
      },
      tests: {
        auth: { success: false, error: null as string | null },
        sheetAccess: { success: false, error: null as string | null, sheets: [] as Array<{ title?: string; id?: number }>, errorCode: undefined as unknown },
        writeTest: { success: false, error: null as string | null, message: undefined as string | undefined, sampleData: undefined as unknown, errorCode: undefined as unknown },
      }
    };

    // Test 1: Authentication
    try {
      if (!serviceEmail || !hasPrivateKey || !spreadsheetId) {
        throw new Error("Missing required environment variables");
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceEmail,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      await auth.getClient();
      result.tests.auth.success = true;
    } catch (error) {
      result.tests.auth.error = error instanceof Error ? error.message : String(error);
    }

    // Test 2: Sheet Access
    if (result.tests.auth.success) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: serviceEmail,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.get({
          spreadsheetId,
          fields: 'sheets(properties(title,sheetId))',
        });

        result.tests.sheetAccess.success = true;
        result.tests.sheetAccess.sheets = response.data.sheets?.map((s) => ({
          title: s.properties?.title ?? undefined,
          id: s.properties?.sheetId ?? undefined
        })) || [];
      } catch (error: unknown) {
        const err = error as { message?: string; code?: unknown };
        result.tests.sheetAccess.error = err?.message || String(error);
        if (err?.code) {
          result.tests.sheetAccess.errorCode = err.code;
        }
      }
    }

    // Test 3: Write Permission Test (read-only check)
    if (result.tests.sheetAccess.success) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: serviceEmail,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Try to read from the first sheet
        const firstSheet = result.tests.sheetAccess.sheets[0]?.title || 'Sheet1';
        const readResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${firstSheet}!A1:A2`,
        });

        result.tests.writeTest.success = true;
        result.tests.writeTest.message = "Read access confirmed";
        result.tests.writeTest.sampleData = readResponse.data.values;
      } catch (error: unknown) {
        const err = error as { message?: string; code?: unknown };
        result.tests.writeTest.error = err?.message || String(error);
        if (err?.code) {
          result.tests.writeTest.errorCode = err.code;
        }
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in sheets debug:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
