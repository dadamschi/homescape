// Homescape Construction — Lead Capture via Google Apps Script
// 
// SETUP:
// 1. Paste this into script.google.com → New Project
// 2. Update TO_EMAIL below with your Gmail address
// 3. Click Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL into your Vercel env var: VITE_GOOGLE_SHEETS_URL

const TO_EMAIL = "dadams.chi@gmail.com"; // ← your Gmail address
const SHEET_NAME = "Leads"; // optional: logs to a Google Sheet too

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // --- Send email notification ---
    const subject = `New Lead: ${data.service || "General Inquiry"} — ${data.name}`;
    const body = `
New inquiry from the Homescape Construction website.

Name:     ${data.name}
Email:    ${data.email}
Phone:    ${data.phone || "—"}
Service:  ${data.service || "—"}
Source:   ${data.source || "Website"}
Time:     ${data.timestamp}

Message:
${data.message}
    `.trim();

    GmailApp.sendEmail(TO_EMAIL, subject, body);

    // --- Log to Google Sheet (optional) ---
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        let sheet = ss.getSheetByName(SHEET_NAME);
        if (!sheet) {
          sheet = ss.insertSheet(SHEET_NAME);
          sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Service", "Message"]);
        }
        sheet.appendRow([
          data.timestamp,
          data.name,
          data.email,
          data.phone || "",
          data.service || "",
          data.message,
        ]);
      }
    } catch (sheetErr) {
      // Sheet logging is optional — silently skip if no sheet attached
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test this function manually in the Apps Script editor before deploying
function testEmail() {
  GmailApp.sendEmail(TO_EMAIL, "Test — Homescape Lead Form", "Apps Script is working!");
}
