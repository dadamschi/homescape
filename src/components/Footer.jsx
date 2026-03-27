import useCMS from "../data";
import Icons from "../Icons";
import { navigate } from "../store";

export default function Footer() {
  const { siteSettings } = useCMS();
  const { tagline, phone, email, social={}, servingSince } = siteSettings;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand"><span className="footer-brand-accent">homescape</span>construction, inc.</div>
            <p className="footer-tagline">{tagline}. {servingSince}.</p>
            <div className="footer-social">
              {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer">{Icons.facebook}</a>}
              {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer">{Icons.instagram}</a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer">{Icons.linkedin}</a>}
            </div> 
          </div>
          <div>
            <div className="footer-heading">Navigation</div>
            <a className="footer-link" onClick={() => navigate("home")}>Home</a>
            <a className="footer-link" onClick={() => navigate("projects")}>Projects</a>
            <a className="footer-link" onClick={() => navigate("about")}>About</a>
            <a className="footer-link" onClick={() => navigate("testimonials")}>Testimonials</a>
          </div>
          {/*<div>*/}
          {/*  <div className="footer-heading">Services</div>*/}
          {/*  <span className="footer-link">Residential</span>*/}
          {/*  <span className="footer-link">Commercial</span>*/}
          {/*  <span className="footer-link">Renovations</span>*/}
          {/*  <span className="footer-link">Consultation</span>*/}
          {/*</div>*/}
          <div>
            <div className="footer-heading">Contact</div>
            {phone && <span className="footer-link">{phone}</span>}
            {email && <span className="footer-link">{email}</span>}
            <a className="footer-link" onClick={() => navigate("contact")} style={{ color: "var(--color-accent)", cursor: "pointer" }}>
              Get a Free Quote →
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Homescape Construction Inc. All rights reserved.</span>
          <span>Crafted with care in the Pacific Northwest</span>
        </div>
      </div>
    </footer>
  );
}
