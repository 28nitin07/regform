# Google Apps Script Webhook Configuration

## � Getting Started (First Time Setup)

If you haven't set up Google Apps Script yet, follow these steps:

### Step 1: Open Your Google Sheet
1. Open your Google Sheet with the **"Finance (Do Not Open)"** sheet
2. This should be the same sheet that has columns: Date, Time, Transaction ID, Payment ID, etc.

### Step 2: Open Apps Script Editor
1. In Google Sheets, click **Extensions** in the top menu
2. Click **Apps Script**
3. A new tab will open with the Apps Script editor
4. You should see a file called `Code.gs` (or it might be empty)

#### ⚠️ Troubleshooting: "Bad Request Error 400"

If you see **"Bad Request Error 400"** when clicking Apps Script, try these solutions:

**Solution 1: Check Sheet Ownership**
- You must **own** the Google Sheet to add Apps Script
- If someone shared it with you, ask them to make you an **owner** (not just editor)
- Or **make a copy**: File → Make a copy (you'll own the copy)

**Solution 2: Clear Browser Data**
1. Close the Google Sheet tab
2. Clear browser cache and cookies:
   - Chrome: `Ctrl/Cmd + Shift + Delete` → Clear cache & cookies for "All time"
   - Make sure to select both "Cookies" and "Cached images and files"
3. Restart your browser
4. Open the sheet again and try Extensions → Apps Script

**Solution 3: Try Incognito/Private Mode**
1. Open the sheet in incognito/private browsing mode
2. Sign in to your Google account
3. Try Extensions → Apps Script
4. If it works, the issue is browser cache (use Solution 2)

**Solution 4: Check Google Account**
- Make sure you're signed in with the correct Google account
- Switch accounts in the top-right corner if needed
- Some organizational accounts restrict Apps Script access

**Solution 5: Direct URL Method**
If none of the above work, try accessing Apps Script directly:
1. Get your spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
2. Go to: `https://script.google.com/home/projects/[YOUR_SPREADSHEET_ID]`
3. Or go to: https://script.google.com/home and click "New Project"
4. In the new project, you can add the webhook code manually

**Solution 6: Create Standalone Script (Detailed Instructions Below)**
If you still can't access Apps Script from the sheet, scroll down to the "Standalone Apps Script Setup" section for complete instructions.

### Step 3: Add the Webhook Code
1. **Delete any existing code** in the editor (if there's any sample code)
2. **Copy the complete code** from the "Complete Working Code" section below
3. **Paste it** into the Apps Script editor
4. **Save the project**: Click the disk icon or press `Ctrl/Cmd + S`
5. **Name your project** (e.g., "Payment Verification Webhook")

### Step 4: Authorize the Script
1. After saving, you might see a prompt to authorize the script
2. Click **Review Permissions**
3. Choose your Google account
4. You might see "Google hasn't verified this app" warning
5. Click **Advanced** → **Go to [Project Name] (unsafe)**
6. Click **Allow** to give the script permission to:
   - Access your spreadsheet
   - Make external HTTP requests (to your webhook)

**Note**: The "unsafe" warning is normal for custom scripts. You're authorizing your own code.

### Step 5: Test the Setup
1. Go back to your Google Sheet
2. Find a row in the **"Finance (Do Not Open)"** sheet
3. Change the **"Send Email?"** dropdown (column O/15) to **"Yes"**
4. Wait a few seconds
5. Check if the confirmation email was sent (check your SMTP logs or recipient's inbox)

### Step 6: View Execution Logs (Optional)
1. In Apps Script editor, click **View → Executions** or **View → Logs**
2. You'll see all webhook calls and their responses
3. Look for "✅ Email sent successfully" messages

---

## 🔐 Security Update Required

The webhook endpoint requires authentication using a secret token to prevent unauthorized access.

---

## 📝 Complete Working Code

Copy this entire code block into your Google Apps Script editor:

**📋 Copy this code:**
```javascript
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var sheetName = sheet.getName();
  
  // Check if the edit was in the Finance sheet
  if (sheetName !== "**Finance (Do Not Open)**") {
    return;
  }
  
  var range = e.range;
  var column = range.getColumn();
  
  // Column 15 is "Send Email?" (O column)
  if (column !== 15) {
    return;
  }
  
  var row = range.getRow();
  var sendEmail = range.getValue();
  
  // Only proceed if "Send Email?" is changed to "Yes"
  if (sendEmail !== "Yes") {
    return;
  }
  
  // Get payment ID from column 4
  var paymentId = sheet.getRange(row, 4).getValue();
  
  if (!paymentId) {
    return;
  }
  
  // Webhook secret for authentication
  var WEBHOOK_SECRET = "ae72ec02779d84c226fc146670e863dde21a1b8f95a8dc83f3fc091024ead1c3";
  
  // Call webhook with authentication
  var url = "https://register.agneepath.co.in/api/payments/verify";
  var payload = {
    paymentId: paymentId,
    sendEmail: sendEmail
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-webhook-secret": WEBHOOK_SECRET
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      Logger.log("✅ Email sent successfully");
    } else if (responseCode === 401) {
      Logger.log("❌ Authentication failed - check webhook secret");
    } else {
      Logger.log("⚠️ Webhook response (" + responseCode + "): " + response.getContentText());
    }
  } catch (error) {
    Logger.log("❌ Webhook error: " + error);
  }
}
```

---

## 🔑 Key Changes

1. **Added `WEBHOOK_SECRET` variable** with the authentication token
2. **Added `headers` field** to the request options with `x-webhook-secret` header
3. **Added `muteHttpExceptions`** to handle 401 responses gracefully
4. **Improved error logging** with status code checking

---

## ✅ Testing

### Manual Test Steps:

1. **Save the script** in Apps Script editor (`Ctrl/Cmd + S`)
2. **Go back to your Google Sheet**
3. **Find any row** in "**Finance (Do Not Open)**" sheet with a valid Payment ID
4. **Click on the "Send Email?" cell** (column O) in that row
5. **Change the dropdown to "Yes"**
6. **Wait 2-5 seconds** for the webhook to execute

### Check if It Worked:

#### Option 1: Check Apps Script Logs
1. Go back to Apps Script editor
2. Click **View → Executions** (or press `Ctrl/Cmd + Enter`)
3. You should see a recent execution
4. Click on it to see the log output
5. Look for: `✅ Email sent successfully`

#### Option 2: Check Server Logs
If you have access to your server:
```bash
# In your server terminal
pm2 logs regform
# or if running with npm run dev:
# Check the terminal where you ran npm run dev
```

#### Option 3: Check Email Inbox
- Check the recipient's email inbox for the confirmation email
- Subject: "Registration Confirmed for Agneepath 7.0"

### Troubleshooting:

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `❌ Authentication failed` | Webhook secret mismatch | Check that WEBHOOK_SECRET in code matches .env files |
| `⚠️ Webhook response (404)` | Wrong URL | Verify webhook URL is correct and server is running |
| `⚠️ Webhook response (500)` | Server error | Check server logs for detailed error |
| `❌ Webhook error: ...` | Network/connection issue | Verify server is accessible from internet |
| No log output at all | Script not running | Check if Apps Script was saved and authorized |
| Payment ID is empty | Wrong column number | Verify Payment ID is in column 4 (D) |

---

## 🚨 Important Security Notes

- **Never commit this secret to git** (it's already in .env files which should be gitignored)
- **Keep the WEBHOOK_SECRET value secret** - don't share it publicly
- **Use the same secret** in both Google Apps Script and your .env files
- If the secret is ever compromised, generate a new one and update both locations

---

## 🔄 Updating the Secret (If Needed)

To generate a new webhook secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then update:
1. `.env.local` - WEBHOOK_SECRET=<new_secret>
2. `.env.production` - WEBHOOK_SECRET=<new_secret>
3. Google Apps Script - WEBHOOK_SECRET variable
4. Restart your application

---

---

## 🔧 Standalone Apps Script Setup

If you can't access Apps Script from the sheet (Error 400), use this method:

### Step 1: Get Your Spreadsheet ID

1. Open your Google Sheet
2. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/1SiiXnYOxEqUexZ6aCB_pUn0kuH8nUpjeTcUgHjvgzqA/edit
   ```
3. Copy the long ID between `/d/` and `/edit`
4. Example: `1SiiXnYOxEqUexZ6aCB_pUn0kuH8nUpjeTcUgHjvgzqA`

### Step 2: Create New Standalone Script

1. Go to: https://script.google.com/home
2. Click **New Project** (blue button)
3. You'll see an empty editor with `function myFunction() {}`

### Step 3: Paste Standalone Code

Delete everything and paste this code:

```javascript
// ===== CONFIGURATION =====
// Replace with your actual Spreadsheet ID
var SPREADSHEET_ID = "1SiiXnYOxEqUexZ6aCB_pUn0kuH8nUpjeTcUgHjvgzqA";
var SHEET_NAME = "**Finance (Do Not Open)**";
var SEND_EMAIL_COLUMN = 15; // Column O
var PAYMENT_ID_COLUMN = 4;  // Column D

// Webhook configuration
var WEBHOOK_SECRET = "ae72ec02779d84c226fc146670e863dde21a1b8f95a8dc83f3fc091024ead1c3";
var WEBHOOK_URL = "https://register.agneepath.co.in/api/payments/verify";

// ===== MAIN FUNCTION =====
function onEdit(e) {
  try {
    // Get the spreadsheet and sheet
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = e.source.getActiveSheet();
    var sheetName = sheet.getName();
    
    // Check if the edit was in the Finance sheet
    if (sheetName !== SHEET_NAME) {
      return;
    }
    
    var range = e.range;
    var column = range.getColumn();
    
    // Check if "Send Email?" column was edited
    if (column !== SEND_EMAIL_COLUMN) {
      return;
    }
    
    var row = range.getRow();
    var sendEmail = range.getValue();
    
    // Only proceed if "Send Email?" is changed to "Yes"
    if (sendEmail !== "Yes") {
      return;
    }
    
    // Get payment ID from the same row
    var paymentId = sheet.getRange(row, PAYMENT_ID_COLUMN).getValue();
    
    if (!paymentId) {
      Logger.log("❌ Payment ID is empty in row " + row);
      return;
    }
    
    // Call webhook with authentication
    var payload = {
      paymentId: paymentId,
      sendEmail: sendEmail
    };
    
    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-webhook-secret": WEBHOOK_SECRET
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log("🔔 Calling webhook for Payment ID: " + paymentId);
    
    var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      Logger.log("✅ Email sent successfully");
    } else if (responseCode === 401) {
      Logger.log("❌ Authentication failed - check webhook secret");
    } else {
      Logger.log("⚠️ Webhook response (" + responseCode + "): " + response.getContentText());
    }
  } catch (error) {
    Logger.log("❌ Webhook error: " + error.toString());
  }
}
``` 

### Step 4: Configure Your Settings

At the top of the code, replace these values:

1. **SPREADSHEET_ID**: Your sheet ID (from Step 1)
2. **SHEET_NAME**: Usually `"**Finance (Do Not Open)**"` (keep the asterisks if your sheet has them)
3. **SEND_EMAIL_COLUMN**: `15` for column O (or count manually from A=1, B=2... O=15)
4. **PAYMENT_ID_COLUMN**: `4` for column D (where your Payment IDs are)

### Step 5: Save and Name Project

1. Click the disk icon or press `Ctrl/Cmd + S`
2. Name it: "Payment Verification Webhook"
3. Wait for "Saved" confirmation

### Step 6: Set Up Trigger

1. Click the **clock icon** ⏰ (Triggers) on the left sidebar
2. Click **Add Trigger** (bottom right)
3. Configure:
   - **Choose which function to run**: `onEdit`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `From spreadsheet`
   - **Select event type**: `On edit`
   - **Failure notification settings**: `Notify me daily` (recommended)
4. Click **Save**

### Step 7: Authorize

1. You'll see "Authorization required"
2. Click **Review Permissions**
3. Choose your Google account
4. Click **Advanced** → **Go to Payment Verification Webhook (unsafe)**
5. Click **Allow**

### Step 8: Test

1. Go back to your Google Sheet
2. Find a row with a Payment ID
3. Change "Send Email?" to "Yes"
4. Wait 5-10 seconds
5. Go back to Apps Script and click **View → Executions**
6. You should see the execution log with "✅ Email sent successfully"

### Troubleshooting Standalone Script

| Issue | Solution |
|-------|----------|
| "Cannot find spreadsheet" | Check SPREADSHEET_ID is correct |
| "Sheet not found" | Check SHEET_NAME exactly matches (including asterisks) |
| Script doesn't run | Make sure trigger is set up (Step 6) |
| Permission denied | Re-run authorization (Step 7) |
| No logs appearing | Check View → Executions (not View → Logs) |

---

## 📞 Support

If you encounter authentication errors:
- Check that WEBHOOK_SECRET matches in both locations
- Verify the header name is exactly `x-webhook-secret` (lowercase)
- Check server logs for unauthorized attempts
- Ensure the secret has no extra spaces or quotes
� Understanding the Code

### How It Works:

1. **Trigger**: The `onEdit(e)` function automatically runs when ANY cell is edited in your spreadsheet
2. **Sheet Check**: It checks if the edit was in the "**Finance (Do Not Open)**" sheet
3. **Column Check**: It only proceeds if column 15 (O - "Send Email?") was edited
4. **Value Check**: It only proceeds if the value changed to "Yes"
5. **Payment ID**: It gets the Payment ID from column 4 (D) in the same row
6. **Webhook Call**: It sends a POST request to your server with:
   - Payment ID
   - Send Email status
   - Authentication secret (for security)
7. **Response Logging**: It logs the result for debugging

### Key Security Features:

1. **Webhook Secret**: Prevents unauthorized access to your email endpoint
2. **Sheet Name Check**: Only processes edits in the Finance sheet
3. **Column Validation**: Only responds to "Send Email?" column changes
4. **Error Handling**: Logs detailed errors for troubleshooting

---

## 🔧 Configuration Reference

| Variable | Value | Where to Change |
|----------|-------|-----------------|
| Sheet Name | `"**Finance (Do Not Open)**"` | Line 6 in the code |
| Send Email Column | `15` (Column O) | Line 14 in the code |
| Payment ID Column | `4` (Column D) | Line 28 in the code |
| Webhook URL | `https://register.agneepath.co.in/api/payments/verify` | Line 33 in the code |
| Webhook Secret | `ae72ec02779d84c226fc146670e863dde21a1b8f95a8dc83f3fc091024ead1c3` | Line 31 in the code |

### To Use Localhost for Testing:
Change line 33 to:
```javascript
var url = "https://your-tunnel-url.trycloudflare.com/api/payments/verify";
```

---

## ✅ Testing Your Setup