import { PageHero } from "../components/sections/PageHero";
import { contactPlaceholders } from "../data/siteContent";

export function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Quote / Contact"
        title="Tell us what you need."
        description="Whether you need a custom site from scratch or ongoing support for an existing one, WilksMedia keeps the process straightforward."
        aside={
          <>
            <span className="eyebrow">Confidence</span>
            <p>Clear scope, direct communication, and premium execution from the first conversation forward.</p>
          </>
        }
      />

      <section className="section">
        <div className="container contact-layout">
          <form className="contact-form panel">
            <div className="form-grid">
              <label>
                <span>Name</span>
                <input type="text" placeholder="Your name" />
              </label>
              <label>
                <span>Email</span>
                <input type="email" placeholder="you@company.com" />
              </label>
              <label>
                <span>Business / Brand</span>
                <input type="text" placeholder="Your business name" />
              </label>
              <label>
                <span>Website Needed or Existing URL</span>
                <input type="text" placeholder="New site or current website link" />
              </label>
              <label>
                <span>Service Needed</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Select a focus
                  </option>
                  <option>New Website</option>
                  <option>Redesign</option>
                  <option>Ongoing Upkeep</option>
                  <option>Build + Ongoing Support</option>
                </select>
              </label>
              <label>
                <span>Budget Range</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Select a range
                  </option>
                  <option>Under $5k</option>
                  <option>$5k - $10k</option>
                  <option>$10k - $20k</option>
                  <option>$20k+</option>
                </select>
              </label>
              <label>
                <span>Timeline</span>
                <input type="text" placeholder="Target launch window" />
              </label>
              <label className="form-grid__full">
                <span>Project Details</span>
                <textarea
                  rows={7}
                  placeholder="What are you building, what should the site communicate, and what kind of support do you expect after launch?"
                />
              </label>
            </div>
            <button type="submit" className="button button--primary">
              Send Request
            </button>
          </form>

          <aside className="contact-aside">
            <div className="panel">
              <span className="eyebrow">Direct Contact</span>
              <h2>Prefer to start by email?</h2>
              <p>
                Use the placeholders below for now, then replace them with the final business contact details.
              </p>
              <div className="contact-list">
                <a href={`mailto:${contactPlaceholders.email}`}>{contactPlaceholders.email}</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  {contactPlaceholders.instagram}
                </a>
              </div>
            </div>
            <div className="panel">
              <span className="eyebrow">Scope Guidance</span>
              <p>
                Good requests usually include what the business does, what the site needs to achieve, what content already exists, and whether ongoing upkeep is needed after launch.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
