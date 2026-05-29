import { useState, type FormEvent } from "react";
import { PageHero } from "../components/sections/PageHero";
import { contactPlaceholders } from "../data/siteContent";
import { useDocumentMeta } from "../lib/useDocumentMeta";

const WORKER_URL = "https://wilksmedia-contact.cooper-adf.workers.dev";

type SubmitStatus = "idle" | "sending" | "success" | "error";

export function QuotePage() {
  useDocumentMeta(
    "Get a Quote — Start Your Project with WilksMedia",
    "Tell WilksMedia about your project. Quick form, response within 1–2 business days. Custom small-business websites starting at $500."
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot — bots fill hidden fields, humans never see it.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const resp = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          websiteUrl,
          projectType,
          budget,
          timeline,
          message,
          website, // honeypot
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error || resp.statusText);
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong sending your request.",
      );
    }
  }

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
          {status === "success" ? (
            <div className="contact-form panel quote-success">
              <span className="eyebrow">Sent</span>
              <h2>Thanks &mdash; we&rsquo;ll be in touch.</h2>
              <p>
                Your request landed in our inbox. Expect a reply within 1&ndash;2 business days at the email you provided.
              </p>
            </div>
          ) : (
            <form className="contact-form panel" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status === "sending"}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "sending"}
                  />
                </label>
                <label>
                  <span>Business / Brand</span>
                  <input
                    type="text"
                    placeholder="Your business name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={status === "sending"}
                  />
                </label>
                <label>
                  <span>Website Needed or Existing URL</span>
                  <input
                    type="text"
                    placeholder="New site or current website link"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    disabled={status === "sending"}
                  />
                </label>
                <label>
                  <span>Service Needed</span>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    disabled={status === "sending"}
                  >
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
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    disabled={status === "sending"}
                  >
                    <option value="" disabled>
                      Select a range
                    </option>
                    <option>$100 - $500</option>
                    <option>$500 - $1,000</option>
                    <option>$1,000 - $2,000</option>
                    <option>$2,000+</option>
                  </select>
                </label>
                <label>
                  <span>Timeline</span>
                  <input
                    type="text"
                    placeholder="Target launch window"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    disabled={status === "sending"}
                  />
                </label>
                <label className="form-grid__full">
                  <span>Project Details</span>
                  <textarea
                    rows={7}
                    placeholder="What are you building, what should the site communicate, and what kind of support do you expect after launch?"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={status === "sending"}
                  />
                </label>

                {/* Honeypot — hidden from real users; bots fill it and get silently rejected */}
                <label className="form-honeypot" aria-hidden="true">
                  <span>Website</span>
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
              </div>

              {status === "error" && (
                <p className="form-error" role="alert">
                  {errorMessage || "Something went wrong sending your request."}
                </p>
              )}

              <button
                type="submit"
                className="button button--primary"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send Request"}
              </button>
            </form>
          )}

          <aside className="contact-aside">
            <div className="panel">
              <span className="eyebrow">Direct Contact</span>
              <h2>Prefer to start by email?</h2>
              <p>Reach out directly anytime &mdash; usually the fastest way to get a conversation started.</p>
              <div className="contact-list">
                <a href={`mailto:${contactPlaceholders.email}`}>{contactPlaceholders.email}</a>
                <a href="https://instagram.com/wilks_media_" target="_blank" rel="noreferrer">
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
