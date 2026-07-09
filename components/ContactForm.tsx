"use client";

import { useState, useCallback } from "react";
import Icons from "./Icons";
import SimpleCaptcha from "./SimpleCaptcha";
import type { LeadFormData } from "@/lib/types";

const EMPTY: LeadFormData = { name: "", email: "", phone: "", service: "", message: "" };

async function submitLead(formData: LeadFormData): Promise<void> {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...formData,
      source: "Contact Page",
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit lead");
  }
}

export default function ContactForm() {
  const [form, setForm] = useState<LeadFormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [isBot, setIsBot] = useState(false);

  const handleCaptchaChange = useCallback((isValid: boolean, honeypotTriggered: boolean) => {
    setCaptchaValid(isValid);
    setIsBot(honeypotTriggered);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaValid || isBot) return;

    setSubmitting(true);
    try {
      await submitLead(form);
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      console.error("Lead submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateField =
    (field: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (success) {
    return (
      <div className="form-success">
        Thank you! We&apos;ve received your inquiry and will be in touch shortly.
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact-name" className="form-label">
            Name
          </label>
          <input
            id="contact-name"
            className="form-input"
            type="text"
            value={form.name}
            onChange={updateField("name")}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email" className="form-label">
            Email
          </label>
          <input
            id="contact-email"
            className="form-input"
            type="email"
            value={form.email}
            onChange={updateField("email")}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact-phone" className="form-label">
            Phone
          </label>
          <input
            id="contact-phone"
            className="form-input"
            type="tel"
            value={form.phone}
            onChange={updateField("phone")}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="contact-message" className="form-label">
          Message
        </label>
        <textarea
          id="contact-message"
          className="form-textarea"
          value={form.message}
          onChange={updateField("message")}
          placeholder="Tell us about your project..."
          required
        />
      </div>
      <SimpleCaptcha onValidChange={handleCaptchaChange} />
      <button className="btn btn-primary" type="submit" disabled={submitting || !captchaValid}>
        {submitting ? "Sending..." : "Send Inquiry"} {!submitting && Icons.arrow}
      </button>
    </form>
  );
}
