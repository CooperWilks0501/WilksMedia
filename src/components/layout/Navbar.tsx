import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navLinks } from "../../data/siteContent";
import { Button } from "../common/Button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        <NavLink to="/" className="brandmark" aria-label="WilksMedia home">
          <span className="brandmark__code">WM / 01</span>
          <span className="brandmark__name">WilksMedia</span>
        </NavLink>

        <nav className="navbar__links" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink key={link.href} to={link.href} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__cta">
          <Button to="/quote">Start Your Site</Button>
        </div>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {navLinks.map((link) => (
              <NavLink key={link.href} to={link.href} className="mobile-menu__link">
                {link.label}
              </NavLink>
            ))}
            <Button to="/quote">Get a Quote</Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
