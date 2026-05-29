import { Button } from "../components/common/Button";
import { Reveal } from "../components/common/Reveal";
import { PageHero } from "../components/sections/PageHero";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export function AboutPage() {
  useDocumentMeta(
    "About Cooper Wilks — Founder of WilksMedia",
    "Cooper Wilks is a 2026 University of South Carolina IT graduate and the solo founder of WilksMedia, a Columbia, SC web design studio for small businesses."
  );
  return (
    <>
      <PageHero
        eyebrow="About"
        title="One developer, focused work."
        description="WilksMedia is a brand-new solo studio launched in 2026 by Cooper Wilks. Every project is designed, built, and supported by one person — no agency layers, no junior handoffs, no offshore middlemen."
        aside={
          <>
            <span className="eyebrow">Solo by design</span>
            <p>
              Direct communication, a single point of contact, and end-to-end ownership of every site I ship.
            </p>
          </>
        }
      />

      <section className="section">
        <div className="container split-panel">
          <Reveal className="panel about-photo">
            <img
              src="/cooper.jpeg"
              alt="Cooper Wilks at his University of South Carolina graduation, May 2026"
              loading="lazy"
            />
          </Reveal>
          <Reveal className="panel about-bio">
            <span className="eyebrow">Cooper Wilks / Founder</span>
            <h2>Hi, I&rsquo;m Cooper.</h2>
            <p>
              I&rsquo;m a 2026 Information Technology graduate from the University of South Carolina&rsquo;s Molinaroli College of Engineering and Computing. WilksMedia is the studio I built around the work I love &mdash; designing and shipping premium small-business websites with the care most agencies have stopped giving them.
            </p>
            <p>
              This is a brand-new solo startup, run entirely by me. Design, development, deployment, ongoing support, every email &mdash; one person. It&rsquo;s intentional. Working with WilksMedia means you talk directly to the person building your site, and the same person is still on the other end of the inbox when you need an update six months later.
            </p>
            <p>
              I&rsquo;d rather take on fewer projects and do them carefully than scale a team I can&rsquo;t personally oversee. Every site I ship is one I&rsquo;m willing to put my name on. (Literally.)
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section--contrast">
        <div className="container case-grid">
          <Reveal className="panel">
            <span className="eyebrow">Education</span>
            <h3>B.S. in Information Technology</h3>
            <p>
              University of South Carolina &middot; Molinaroli College of Engineering and Computing &middot; Graduated 2026
            </p>
          </Reveal>
          <Reveal className="panel">
            <span className="eyebrow">How it works</span>
            <h3>One contact, one builder, no surprises</h3>
            <p>
              You email me, I build it. No account managers, no creative-director hand-offs, no agency-style mark-ups. Clean process from quote to launch and through ongoing upkeep.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section final-cta">
        <div className="container final-cta__inner panel">
          <div>
            <span className="eyebrow">Ready to talk?</span>
            <h2>Let&rsquo;s see if WilksMedia is a fit.</h2>
            <p>Short form, no pressure. I&rsquo;ll get back to you within 1&ndash;2 business days.</p>
          </div>
          <Button to="/quote">Start a Project</Button>
        </div>
      </section>
    </>
  );
}
