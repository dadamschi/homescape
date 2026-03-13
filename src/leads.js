// --- GOOGLE SHEETS LEAD CAPTURE ----------------------------------------------
// Replace SHEETS_URL with your deployed Google Apps Script Web App URL.
// See homescape-lead-capture.gs for the server-side script.

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || "";

export async function submitLead(formData) {
  if (!SHEETS_URL) {
    console.log("Lead submitted (no Sheets URL configured):", formData);
    return new Promise((resolve) => setTimeout(resolve, 1200));
  }

  const response = await fetch(SHEETS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...formData,
      source: "Website Contact Form",
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit lead");
  }

  return response.json();
}
