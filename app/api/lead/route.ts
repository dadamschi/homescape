import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

    // If no API key configured, log and return success
    if (!process.env.RESEND_API_KEY) {
      console.log("Lead submitted (no Resend API key configured):", body);
      return NextResponse.json({ success: true, message: "Lead recorded" });
    }

    // Send email notification
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Homescape Website <noreply@homescapeconstruction.com>",
      to: "info@homescapeconstruction.com",
      replyTo: body.email,
      subject: `New Lead: ${body.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${body.name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phone || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${body.message || "No message"}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Source: ${body.source || "Contact Form"}<br />
          Submitted: ${body.timestamp || new Date().toISOString()}
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  }
}
