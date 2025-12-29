import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { google } from "googleapis";

/**
 * POST /api/sync/due-payments
 * 
 * Syncs due payments data to Google Sheets "Due Payments" tab
 * This should be called after form modifications to update outstanding payments
 */
export async function POST(req: NextRequest) {
  try {
    console.log("📊 Syncing due payments to Google Sheets...");

    const { db } = await connectToDatabase();
    const paymentsCollection = db.collection("payments");
    const formsCollection = db.collection("form");
    const usersCollection = db.collection("users");

    // Get all verified payments
    const payments = await paymentsCollection
      .find({ status: "verified" })
      .toArray();

    const duePaymentsData: unknown[][] = [];

    for (const payment of payments) {
      if (!payment.ownerId) continue;

      // Get user details
      const user = await usersCollection.findOne({ _id: payment.ownerId });
      if (!user) continue;

      // Get all forms for this user
      const userForms = await formsCollection
        .find({ ownerId: payment.ownerId })
        .toArray();

      let totalOriginalPlayers = 0;
      let totalCurrentPlayers = 0;
      const sportsModified: string[] = [];

      // Calculate player counts for each form
      for (const form of userForms) {
        const fields = form.fields as Record<string, unknown> | undefined;
        const currentPlayerFields = (fields?.playerFields as Record<string, unknown>[]) || [];
        const currentPlayers = currentPlayerFields.length;

        let originalPlayers = currentPlayers;
        
        const paymentData = payment.paymentData ? 
          (typeof payment.paymentData === 'string' ? 
            JSON.parse(payment.paymentData) : 
            payment.paymentData) : 
          null;

        if (paymentData?.submittedForms?.[form.title]) {
          originalPlayers = paymentData.submittedForms[form.title].Players || currentPlayers;
        }

        const difference = currentPlayers - originalPlayers;

        if (difference !== 0) {
          sportsModified.push(`${form.title} (${difference > 0 ? '+' : ''}${difference})`);
        }

        totalOriginalPlayers += originalPlayers;
        totalCurrentPlayers += currentPlayers;
      }

      const playerDifference = totalCurrentPlayers - totalOriginalPlayers;

      // Only add to due payments if there's a positive difference
      if (playerDifference > 0) {
        const currentDate = new Date();
        const date = currentDate.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const time = currentDate.toLocaleTimeString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        duePaymentsData.push([
          date,
          time,
          user.name || "N/A",
          user.email || "N/A",
          user.universityName || "N/A",
          payment.transactionId || "N/A",
          sportsModified.join(", "),
          totalOriginalPlayers.toString(),
          totalCurrentPlayers.toString(),
          playerDifference.toString(),
          (playerDifference * 800).toString(),
          "Pending"
        ]);
      }
    }

    // Authenticate with Google Sheets API
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey) {
      console.error("❌ Missing Google credentials: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY");
      return NextResponse.json(
        { success: false, message: "Google Sheets credentials not configured" },
        { status: 500 }
      );
    }

    if (!spreadsheetId) {
      console.error("❌ Missing GOOGLE_SHEET_ID");
      return NextResponse.json(
        { success: false, message: "Google Sheet ID not configured" },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = "Due Payments";

    // Check if sheet exists, create if not
    try {
      const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetExists = sheetMetadata.data.sheets?.some(
        sheet => sheet.properties?.title === sheetName
      );

      if (!sheetExists) {
        // Create the sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }]
          }
        });

        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:L1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              "Date",
              "Time",
              "User Name",
              "Email",
              "University",
              "Original Transaction ID",
              "Sports Modified",
              "Original Players",
              "Current Players",
              "Additional Players",
              "Amount Due (₹)",
              "Status"
            ]]
          }
        });
      }
    } catch (error) {
      console.error("Error checking/creating sheet:", error);
    }

    // Clear existing data (except header)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A2:L`,
    });

    // Write new data if there are any due payments
    if (duePaymentsData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: duePaymentsData
        }
      });
    }

    console.log(`✅ Synced ${duePaymentsData.length} due payment records to Google Sheets`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${duePaymentsData.length} due payment records`,
      count: duePaymentsData.length
    });

  } catch (error) {
    console.error("❌ Error syncing due payments to Google Sheets:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage || "Failed to sync due payments to Google Sheets",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
