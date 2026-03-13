import CMS_DATA from "../data";
import Icons from "../Icons";
import { navigate } from "../store";

export default function Footer() {
  const { siteSettings } = CMS_DATA;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              Homescape<span>.</span>
            </div>
            <p className="footer-tagline">
              {siteSettings.tagline}. Serving the Pacific Northwest since 2012.
            </p>
            <div className="footer-social">
              <a href={siteSettings.social.facebook} target="_blank" rel="noopener noreferrer">
                {Icons.facebook}
              </a>
              <a href={siteSettings.social.instagram} target="_blank" rel="noopener noreferrer">
                {Icons.instagram}
              </a>
              <a href={siteSettings.social.linkedin} target="_blank" rel="noopener noreferrer">
                {Icons.linkedin}
              </a>
            </div>
          </div>
          <div>
            <div className="footer-heading">Navigation</div>
            <a className="footer-link" onClick={() => navigate("home")}>Home</a>
            <a className="footer-link" onClick={() => navigate("projects")}>Projects</a>
            <a className="footer-link" onClick={() => navigate("about")}>About</a>
            <a className="footer-link" onClick={() => navigate("testimonials")}>Testimonials</a>
          </div>
          <div>
            <div className="footer-heading">Services</div>
            <span className="footer-link">Residential</span>
            <span className="footer-link">Commercial</span>
            <span className="footer-link">Renovations</span>
            <span className="footer-link">Consultation</span>
          </div>
          <div>
            <div className="footer-heading">Contact</div>
            <span className="footer-link">{siteSettings.phone}</span>
            <span className="footer-link">{siteSettings.email}</span>
            <a
              className="footer-link"
              onClick={() => navigate("contact")}
              style={{ color: "var(--color-accent)", cursor: "pointer" }}
            >
              Get a Free Quote →
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Homescape Construction. All rights
            reserved.
          </span>
          <span>Crafted with care in the Pacific Northwest</span>
        </div>
      </div>
    </footer>
  );
}
