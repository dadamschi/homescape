"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  useEffect(() => {
    // Send 404 notification
    const notify = async () => {
      try {
        await fetch("/api/404-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: window.location.href,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        // Silently fail - don't break the 404 page
        console.error("Failed to notify 404:", error);
      }
    };

    notify();
  }, []);

  return (
    <div className="not-found-page">
      <h1>Page Not Found</h1>
      <p>Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
      <div className="not-found-actions">
        <Link href="/" className="btn btn-primary">
          Go Home
        </Link>
        <Link href="/contact" className="btn btn-secondary">
          Contact Us
        </Link>
      </div>
    </div>
  );
}