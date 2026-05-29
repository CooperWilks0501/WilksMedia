import { SectionHeading } from "../components/common/SectionHeading";
import { Reveal } from "../components/common/Reveal";
import { PageHero } from "../components/sections/PageHero";
import { Button } from "../components/common/Button";
import { extendedServices, serviceHighlights } from "../data/siteContent";

export function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Built and maintained with the same level of care."
        description="WilksMedia designs, develops, launches, and supports premium websites through a structure that stays simple for the client."
        aside={
          <>
            <span className="eyebrow">Model</span>
            <p>We design and build the site, then keep it updated through a simple monthly upkeep plan.</p>
          </>
        }
      />

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Core Services"
            title="Clear offers with premium execution."
          />
          <div className="service-grid">
            {serviceHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} className="service-card panel">
                  <div className="service-card__icon">
                    <Icon size={18} />
                  </div>
                  <span className="eyebrow">{item.eyebrow}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--contrast">
        <div className="container split-panel">
          <Reveal className="panel">
            <span className="eyebrow">Offer Structure</span>
            <h2>Launch first. Support ongoing.</h2>
            <p>
              The initial engagement covers strategy, design, development, and launch. After that, WilksMedia can stay on through an ongoing monthly upkeep plan for updates, refinements, and support.
            </p>
          </Reveal>
          <Reveal className="panel">
            <span className="eyebrow">Why It Works</span>
            <p>
              No confusing agency layers. No abandoned website after launch. One studio builds the system, understands the details, and keeps the experience current over time.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Capabilities"
            title="Flexible deliverables without a bloated service list."
          />
          <div className="feature-list">
            {extendedServices.map((item) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} className="feature-list__item">
                  <div className="feature-list__icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="eyebrow">{item.eyebrow}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section final-cta">
        <div className="container final-cta__inner panel">
          <div>
            <span className="eyebrow">Next Step</span>
            <h2>Tell us what the site needs to do.</h2>
            <p>Whether it starts from scratch or improves an existing presence, the process stays clear.</p>
          </div>
          <Button to="/quote">Request a Quote</Button>
        </div>
      </section>
    </>
  );
}
