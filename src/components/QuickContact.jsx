import { useState, useEffect } from "react";
import { submitLead } from "../leads";
import Icons from "../Icons";

const EMPTY = { name: "", email: "", phone: "", service: "", message: "" };

export default function QuickContact() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Lock body scroll when drawer is open (critical on mobile)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
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
    // reset success state after drawer closes so it's fresh next open
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
            <p>Thanks! We'll be in touch!</p>
            <button className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }} onClick={handleClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="qc-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" value={form.name} onChange={update("name")} required placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={update("email")} required placeholder="you@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={form.phone} onChange={update("phone")} placeholder="(optional)" />
            </div>
            {/*<div className="form-group">*/}
            {/*  <label className="form-label">Service</label>*/}
            {/*  <select className="form-input" value={form.service} onChange={update("service")}>*/}
            {/*    <option value="">Select a service</option>*/}
            {/*    <option value="residential">Residential Build</option>*/}
            {/*    <option value="commercial">Commercial Build</option>*/}
            {/*    <option value="renovation">Renovation</option>*/}
            {/*    <option value="consultation">General Consultation</option>*/}
            {/*  </select>*/}
            {/*</div>*/}
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" value={form.message} onChange={update("message")} placeholder="Tell us about your project..." style={{ minHeight: "80px" }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
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
