"use client";

import { useState, useEffect } from "react";
import Icons from "./Icons";
import type { LeadFormData } from "@/lib/types";

const EMPTY: LeadFormData = { name: "", email: "", phone: "", service: "", message: "" };

async function submitLead(formData: LeadFormData): Promise<void> {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...formData,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit lead");
  }
}

export default function QuickContact() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeadFormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const update = (field: keyof LeadFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitLead({ ...form, source: "Quick Contact Widget" });
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      console.error("Quick contact failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSuccess(false), 300);
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div className="qc-backdrop" onClick={handleClose} />}

      {/* Sliding drawer */}
      <div className={`qc-drawer ${open ? "qc-drawer--open" : ""}`}>
        <div className="qc-header">
          <span className="qc-title">Contact Us About Your Project!</span>
          <button className="qc-close" onClick={handleClose} aria-label="Close">
            {Icons.close}
          </button>
        </div>

        {success ? (
          <div className="qc-success">
            <div className="qc-success-icon">✓</div>
            <p>Thanks! We&apos;ll be in touch!</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "1rem", width: "100%" }}
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form className="qc-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="qc-name" className="form-label">Name</label>
              <input
                id="qc-name"
                className="form-input"
                type="text"
                value={form.name}
                onChange={update("name")}
                required
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="qc-email" className="form-label">Email</label>
              <input
                id="qc-email"
                className="form-input"
                type="email"
                value={form.email}
                onChange={update("email")}
                required
                placeholder="you@email.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="qc-phone" className="form-label">Phone</label>
              <input
                id="qc-phone"
                className="form-input"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="(optional)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="qc-message" className="form-label">Message</label>
              <textarea
                id="qc-message"
                className="form-textarea"
                value={form.message}
                onChange={update("message")}
                placeholder="Tell us about your project..."
                style={{ minHeight: "80px" }}
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ width: "100%" }}
            >
              {submitting ? "Sending…" : "Send Inquiry"} {!submitting && Icons.arrow}
            </button>
          </form>
        )}
      </div>

      {/* Floating tab — hidden when drawer is open */}
      {!open && (
        <button className="qc-tab" onClick={() => setOpen(true)} aria-label="Contact us">
          <span className="qc-tab-icon">{Icons.mail}</span>
          <span className="qc-tab-label">Contact Us!</span>
        </button>
      )}
    </>
  );
}
