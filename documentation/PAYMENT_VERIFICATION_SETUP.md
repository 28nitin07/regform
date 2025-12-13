# Payment Verification Dropdown Setup Guide

This guide explains how to set up the "Status" dropdown column in Google Sheets with automatic email triggering when registration is confirmed.

## 1. Add Data Validation to "Status" Column

After deploying the updated code, both "Verified?" and "Status" columns will appear in your Payments sheet with "In Progress" as the default value.

- **"Verified?" (Column N)**: For internal payment verification tracking
- **"Status" (Column O)**: When changed to "Yes", triggers automatic confirmation email to the registrant

### Dropdown setup (done automatically):

The dropdowns are automatically configured when you run the initial sync. Both columns will have these options:
- `Yes`
- `No` 
- `In Progress`
- `Not Started`

If you need to manually add or fix the dropdown validation:

1. Open your Google Sheet (Payments tab)
2. Select the entire "Status" column (column O, starting from row 2)
3. Click **Data** → **Data validation**
4. Set:
   - **Criteria**: List of items
   - **Values**: `Yes, No, In Progress, Not Started`
   - Check "Show dropdown list in cell"
   - Click **Save**

### To add conditional formatting (colors) - Optional:

You can add colored formatting to make the status visually clear:

1. Select the "Status" column (O2:O)
2. Click **Format** → **Conditional formatting**
3. Add four rules:

**Rule 1 - Yes (Light Green):**
- Format cells if: **Text is exactly** `Yes`
- Formatting style: Background color `#d9ead3` (light green)
- Click **Done**

**Rule 2 - No (Light Red):**
- Format cells if: **Text is exactly** `No`
- Formatting style: Background color `#f4cccc` (light red)
- Click **Done**

**Rule 3 - In Progress (Yellow):**
- Format cells if: **Text is exactly** `In Progress`
- Formatting style: Background color `#fff2cc` (yellow)
- Click **Done**

**Rule 4 - Not Started (Light Gray):**
- Format cells if: **Text is exactly** `Not Started`
- Formatting style: Background color `#e0e0e0` (light gray)
- Click **Done**

## 2. Set Up Google Apps Script Trigger

To automatically send confirmation emails when status changes to "Yes":

### Step 1: Open Script Editor
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste the following script:

```javascript
/**
 * Webhook URL - Replace with your actual production URL
 */
const WEBHOOK_URL = "https://register.agneepath.co.in/api/payments/verify";

/**
 * Name of the sheet to monitor
 */
const SHEET_NAME = "Payments";

/**
 * Column index for "Status" (O = 15) - This triggers the confirmation email
 */
const STATUS_COLUMN = 15;

/**
 * Column index for "Payment ID" (D = 4)
 */
const PAYMENT_ID_COLUMN = 4;

/**
 * Trigger function that runs on every edit
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  
  // Only process edits in the Payments sheet
  if (sheet.getName() !== SHEET_NAME) {
    return;
  }
  
  const range = e.range;
  const row = range.getRow();
  const column = range.getColumn();
  
  // Only process edits to the "Verified?" column (skip header row)
  if (column !== VERIFIED_COLUMN || row === 1) {
    return;
  }
  
  const newValue = range.getValue();
  
  // Only trigger webhook when changed to "Yes"
  if (newValue !== "Yes") {
    Logger.log(`Status changed to "${newValue}" - no email triggered`);
    return;
  }
  
  // Get the Payment ID from the same row
  const paymentId = sheet.getRange(row, PAYMENT_ID_COLUMN).getValue();
  
  if (!paymentId) {
    Logger.log("No Payment ID found in row " + row);
    return;
  }
  
  // Call the webhook
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        paymentId: paymentId,
        status: newValue
      }),
      muteHttpExceptions: true
    });
    
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (statusCode === 200) {
      Logger.log("✅ Confirmation email sent for payment: " + paymentId);
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "Confirmation email sent successfully!", 
        "Payment Verified", 
        3
      );
    } else {
      Logger.log("❌ Webhook failed: " + statusCode + " - " + responseText);
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "Failed to send email. Check logs.", 
        "Error", 
        5
      );
    }
  } catch (error) {
    Logger.log("❌ Error calling webhook: " + error);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Error: " + error, 
      "Webhook Failed", 
      5
    );
  }
}

/**
 * Test function to manually trigger webhook
 * Run this to test without changing the sheet
 */
function testWebhook() {
  const testPaymentId = "YOUR_TEST_PAYMENT_ID"; // Replace with actual payment ID
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        paymentId: testPaymentId,
        status: "Yes"
      }),
      muteHttpExceptions: true
    });
    
    Logger.log("Status: " + response.getResponseCode());
    Logger.log("Response: " + response.getContentText());
  } catch (error) {
    Logger.log("Error: " + error);
  }
}
```

### Step 2: Save and Test
1. Click the disk icon or **Ctrl+S** to save
2. Name your project: "Payment Verification Trigger"
3. To test:
   - Update `testPaymentId` in the `testWebhook()` function with a real payment ID
   - Select `testWebhook` from the function dropdown
   - Click **Run**
   - Authorize the script when prompted
   - Check logs: **View** → **Logs**

### Step 3: Deploy
The script will automatically run when you edit the "Verified?" column. No additional triggers needed - it uses the built-in `onEdit` trigger.

## 3. How It Works

1. **Payment submitted** → Row added to sheet with "In Progress" status
2. **Admin reviews payment** → Changes dropdown to "Yes", "No", or leaves as "In Progress"
3. **When changed to "Yes"**:
   - Apps Script detects the change
   - Calls `/api/payments/verify` webhook
   - Webhook fetches payment and user details
   - Sends `payment-confirmed.html` email to user
4. **User receives** → Confirmation email with payment details

## 4. Manual Email Trigger (Alternative)

If you prefer not to use Apps Script, you can manually trigger emails via API:

```bash
curl -X POST https://register.agneepath.co.in/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "PAYMENT_ID_HERE", "status": "Yes"}'
```

## Troubleshooting

### Script not running?
- Make sure the script is saved
- Check that column numbers match (Payment ID = column 4, Verified? = column 14)
- View execution logs: **Apps Script** → **Executions**

### Email not sent?
- Check Apps Script logs for webhook response
- Verify WEBHOOK_URL is correct
- Check server logs for API errors
- Ensure payment ID exists in database

### Colors not showing?
- Reapply conditional formatting rules
- Make sure cell values exactly match "Yes", "No", "In Progress" (case-sensitive)
