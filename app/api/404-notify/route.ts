import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface NotFoundData {
  url: string;
  referrer: string | null;
  userAgent: string | null;
  timestamp: string;
}

// Simple in-memory rate limiting to avoid email spam
const recentNotifications = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour per unique URL

export async function POST(request: NextRequest) {
  try {
    const body: NotFoundData = await request.json();

    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Rate limit: don't send duplicate emails for the same URL within 1 hour
    const lastNotified = recentNotifications.get(body.url);
    if (lastNotified && Date.now() - lastNotified < RATE_LIMIT_MS) {
      return NextResponse.json({ success: true, message: "Already notified" });
    }

    // If no API key configured, just log
    if (!process.env.RESEND_API_KEY) {
      console.log("404 Error (no Resend API key):", body);
      return NextResponse.json({ success: true });
    }

    // Send email notification
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Homescape Website <noreply@homescapeconstruction.com>",
      to: "dadams.chi@gmail.com",
      subject: `404 Error: ${body.url}`,
      html: `
        <h2>404 Page Not Found</h2>
        <p><strong>URL:</strong> ${body.url}</p>
        <p><strong>Referrer:</strong> ${body.referrer || "Direct / No referrer"}</p>
        <p><strong>User Agent:</strong> ${body.userAgent || "Unknown"}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Timestamp: ${body.timestamp}
        </p>
        <p style="color: #666; font-size: 12px;">
          ${body.referrer ? "This broken link exists on another page and should be fixed." : "User may have typed the URL directly or used an old bookmark."}
        </p>
      `,
    });

    // Mark as notified
    recentNotifications.set(body.url, Date.now());

    // Clean up old entries periodically
    if (recentNotifications.size > 1000) {
      const now = Date.now();
      for (const [url, time] of recentNotifications) {
        if (now - time > RATE_LIMIT_MS) {
          recentNotifications.delete(url);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("404 notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}