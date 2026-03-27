import { useState } from "react";
import useCMS from "../data";
import Icons from "../Icons";
import { submitLead } from "../leads";

export default function ContactPage() {
  const { locations, siteSettings } = useCMS();
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitLead(form);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (err) {
      console.error("Lead submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Contact</div>
        <h2 className="section-title animate-fade-up animate-delay-1">Let's build something great</h2>
        <p className="section-subtitle animate-fade-up animate-delay-2 hide-mobile" style={{ marginBottom: "3rem" }}>
          Ready to start your project? Reach out and we'll get back to you!
        </p>
        <div className="contact-grid">
          <div className="animate-fade-up animate-delay-3">
            {success ? (
              <div className="form-success">
                Thank you! We've received your inquiry and will be in touch shortly.
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" type="text" value={form.name} onChange={updateField("name")} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={updateField("email")} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={form.phone} onChange={updateField("phone")} />
                  </div>
                  {/*<div className="form-group">*/}
                  {/*  <label className="form-label">Service</label>*/}
                  {/*  <select className="form-input" value={form.service} onChange={updateField("service")}>*/}
                  {/*    <option value="">Select a service</option>*/}
                  {/*    <option value="residential">Residential Build</option>*/}
                  {/*    <option value="commercial">Commercial Build</option>*/}
                  {/*    <option value="renovation">Renovation</option>*/}
                  {/*    <option value="consultation">General Consultation</option>*/}
                  {/*  </select>*/}
                  {/*</div>*/}
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" value={form.message} onChange={updateField("message")} placeholder="Tell us about your project..." required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Inquiry"} {!submitting && Icons.arrow}
                </button>
              </form>
            )}
          </div>
          <div className="animate-fade-up animate-delay-4">
            {/*<div className="section-label" style={{ marginBottom: "1.25rem" }}>Our Locations</div>*/}
            {locations.map((loc) => (
              <div key={loc._id} className="location-card">
                {/*<div className="location-name">{loc.name}</div>*/}
                { loc.address &&
                <div className="location-detail">{Icons.mapPin} {loc.address}</div>
                }
                <div className="section-label" style={{ marginBottom: "0.75rem" }}>Call Us</div>
                <div className="location-detail hide-mobile">{Icons.phone} {loc.phone}</div>
                <a className="location-detail show-mobile-only" href={`tel:${loc.phone.replace(/\D/g, '')}`}>{Icons.phone} {loc.phone}</a>
                {siteSettings.email && (
                    <div style={{ marginTop: "2rem" }}>
                      <div className="section-label" style={{ marginBottom: "0.75rem" }}>Email Us</div>
                      <a className="location-detail" href={`mailto:${siteSettings.email}`} style={{ fontSize: "0.95rem" }}>
                        {Icons.mail} {siteSettings.email}
                      </a>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
