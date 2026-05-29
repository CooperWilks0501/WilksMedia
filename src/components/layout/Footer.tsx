import { Link } from "react-router-dom";
import { contactPlaceholders, navLinks } from "../../data/siteContent";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <span className="eyebrow">WilksMedia</span>
          <p className="footer-statement">
            Premium websites with clear structure, modern execution, and ongoing upkeep built into the relationship.
          </p>
        </div>

        <div>
          <span className="eyebrow">Navigate</span>
          <div className="footer-links">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow">Contact</span>
          <div className="footer-links">
            <a href={`mailto:${contactPlaceholders.email}`}>{contactPlaceholders.email}</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              {contactPlaceholders.instagram}
            </a>
            <p className="footer-note">{contactPlaceholders.note}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
