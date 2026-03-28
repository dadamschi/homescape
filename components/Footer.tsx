import Link from "next/link";
import Icons from "./Icons";
import type { SiteSettings } from "@/lib/types";

interface FooterProps {
  siteSettings: SiteSettings;
}

export default function Footer({ siteSettings }: FooterProps) {
  const { tagline, phone, email, social = {}, servingSince } = siteSettings;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="footer-brand-accent">homescape</span>construction, inc.
            </div>
            <p className="footer-tagline">{tagline}. {servingSince}.</p>
            <div className="footer-social">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer">
                  {Icons.facebook}
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer">
                  {Icons.instagram}
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
                  {Icons.linkedin}
                </a>
              )}
            </div>
          </div>
          <div>
            <div className="footer-heading">Navigation</div>
            <Link className="footer-link" href="/">Home</Link>
            <Link className="footer-link" href="/projects">Projects</Link>
            <Link className="footer-link" href="/about">About</Link>
            <Link className="footer-link" href="/testimonials">Testimonials</Link>
            <Link className="footer-link" href="/contact">Contact Us</Link>
          </div>
          <div>
            <div className="footer-heading">Contact</div>
            {phone && <span className="footer-link hide-mobile">{Icons.phone} {phone}</span>}
            {phone && (
              <a className="footer-link show-mobile-only" href={`tel:${phone.replace(/\D/g, "")}`}>
                {Icons.phone} {phone}
              </a>
            )}
            {email && (
              <a className="footer-link" href={`mailto:${email}`}>
                {Icons.mail} {email}
              </a>
            )}
            <Link
              className="footer-link"
              href="/contact"
              style={{ color: "var(--color-accent)", cursor: "pointer" }}
            >
              Contact Us! &rarr;
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Homescape Construction Inc. All rights reserved.</span>
          <span>Crafted with care in and around Chicago</span>
        </div>
      </div>
    </footer>
  );
}
