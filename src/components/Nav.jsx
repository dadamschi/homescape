import { useState } from "react";
import useStore, { navigate } from "../store";
import Icons from "../Icons";
import ThemeSwitch from "./ThemeSwitch";

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
          <span className="nav-logo-accent">homescape</span>construction, inc.
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
          {/*<li>*/}
          {/*  <a className="nav-cta" onClick={() => handleNav("contact")}>*/}
          {/*    Get a Quote*/}
          {/*  </a>*/}
          {/*</li>*/}
        </ul>
        <ThemeSwitch />
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
            Contact us!
          </a>
        </div>
      )}
    </>
  );
}
