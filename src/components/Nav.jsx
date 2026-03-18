import { useState } from "react";
import useStore, { navigate } from "../store";
import Icons from "../Icons";

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "testimonials", label: "Testimonials" },
];

export default function Nav() {
  const currentPage = useStore((s) => s.currentPage);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (page) => {
    navigate(page);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-logo" onClick={() => handleNav("home")}>
          Homescape Construction Inc<span>.</span>
        </div>
        <ul className="nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                className={currentPage === l.id ? "active" : ""}
                onClick={() => handleNav(l.id)}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a className="nav-cta" onClick={() => handleNav("contact")}>
              Get a Quote
            </a>
          </li>
        </ul>
        <button className="nav-hamburger" onClick={() => setMenuOpen(true)}>
          {Icons.menu}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>
            {Icons.close}
          </button>
          {NAV_LINKS.map((l) => (
            <a key={l.id} onClick={() => handleNav(l.id)}>
              {l.label}
            </a>
          ))}
          <a
            onClick={() => handleNav("contact")}
            style={{ color: "var(--color-accent)" }}
          >
            Get a Quote
          </a>
        </div>
      )}
    </>
  );
}
