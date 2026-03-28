import { NextRequest, NextResponse } from "next/server";

const SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  source?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // If no Sheets URL configured, log and return success
    if (!SHEETS_URL) {
      console.log("Lead submitted (no Sheets URL configured):", body);
      return NextResponse.json({ success: true, message: "Lead recorded" });
    }

    // Forward to Google Sheets
    const response = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        timestamp: body.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Sheets API returned ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  }
}
