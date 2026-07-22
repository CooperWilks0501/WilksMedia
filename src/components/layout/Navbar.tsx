import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { navLinks } from "../../data/siteContent";
import { Button } from "../common/Button";

// module-level so it survives Navbar remounts on navigation
let brandClicks: number[] = [];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleBrandClick = (e: React.MouseEvent) => {
    const now = Date.now();
    brandClicks = [...brandClicks, now].filter((t) => now - t < 2000);
    if (brandClicks.length >= 5) {
      brandClicks = [];
      e.preventDefault(); // stop the NavLink from navigating to "/" and overriding us
      navigate("/admin");
    }
  };

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
        <NavLink to="/" className="brandmark" aria-label="WilksMedia home" onClick={handleBrandClick}>
          <img src="/WilksMediaLogo.png" alt="" className="brandmark__logo" />
          <div className="brandmark__text">
            <span className="brandmark__code">WM / 01</span>
            <span className="brandmark__name">WilksMedia</span>
          </div>
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
