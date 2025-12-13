# Google Apps Script Webhook Configuration

## 🔐 Security Update Required

The webhook endpoint now requires authentication using a secret token to prevent unauthorized access.

---

## 📝 Update Your Google Apps Script

1. **Open Your Google Sheet** with the Finance data
2. **Go to Extensions → Apps Script**
3. **Find the webhook trigger function** (usually in `Code.gs`)
4. **Update the webhook call** to include the authentication header

### Current Code (Insecure):
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
  
  // Call webhook
  var url = "https://register.agneepath.co.in/api/payments/verify";
  var payload = {
    paymentId: paymentId,
    sendEmail: sendEmail
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Webhook response: " + response.getContentText());
  } catch (error) {
    Logger.log("Webhook error: " + error);
  }
}
```

### Updated Code (Secure) - **USE THIS**:
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

After updating the script:

1. **Save** the Apps Script (`Ctrl/Cmd + S`)
2. **Test** by changing a "Send Email?" dropdown to "Yes"
3. **Check logs** via **View → Logs** or **Executions**
4. You should see "✅ Email sent successfully" if authentication works

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

## 📞 Support

If you encounter authentication errors:
- Check that WEBHOOK_SECRET matches in both locations
- Verify the header name is exactly `x-webhook-secret` (lowercase)
- Check server logs for unauthorized attempts
- Ensure the secret has no extra spaces or quotes
