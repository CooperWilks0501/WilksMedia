import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Reveal } from "../components/common/Reveal";
import { SectionHeading } from "../components/common/SectionHeading";
import { HomeHero } from "../components/sections/HomeHero";
import {
  differentiators,
  portfolioProjects,
  processSteps,
  serviceHighlights
} from "../data/siteContent";
import { staggerContainer, fadeUp } from "../lib/motion";

export function HomePage() {
  return (
    <>
      <HomeHero />

      <section className="section">
        <div className="container intro-grid">
          <Reveal className="panel mission-panel">
            <span className="eyebrow">What We Do</span>
            <h2>A digital presence should feel premium before a word is read.</h2>
            <p>
              WilksMedia exists to give businesses a web presence that feels premium, performs with purpose, and evolves with them. We design and build custom websites that look exceptional, communicate clearly, and stay supported through simple ongoing upkeep.
            </p>
          </Reveal>
          <Reveal className="intro-aside">
            <div className="intro-aside__item">
              <span className="eyebrow">Positioning</span>
              <p>Premium boutique studio for businesses that need custom websites and dependable upkeep.</p>
            </div>
            <div className="intro-aside__item">
              <span className="eyebrow">Approach</span>
              <p>Visual restraint, angular detail, motion with discipline, and strong conversion-focused structure.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--contrast">
        <div className="container">
          <SectionHeading
            eyebrow="Services Snapshot"
            title="Built to launch cleanly. Structured to stay maintained."
            description="WilksMedia handles both the website build and the long-term upkeep, so the experience stays consistent after launch."
          />
          <motion.div
            className="service-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {serviceHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article key={item.title} className="service-card panel" variants={fadeUp}>
                  <div className="service-card__icon">
                    <Icon size={18} />
                  </div>
                  <span className="eyebrow">{item.eyebrow}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container why-grid">
          <SectionHeading
            eyebrow="Why WilksMedia"
            title="Custom work, modern execution, simple support."
            description="The goal is not just a better-looking site. The goal is a site that feels credible, current, and easy to keep sharp."
          />
          <div className="why-list">
            {differentiators.map((item) => (
              <Reveal key={item} className="why-list__item">
                <span />
                <p>{item}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--process">
        <div className="container">
          <SectionHeading
            eyebrow="Process"
            title="A clear system from first conversation to long-term support."
          />
          <div className="timeline">
            {processSteps.map((step) => (
              <Reveal key={step.index} className="timeline__item panel">
                <span className="timeline__index">{step.index}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Featured Work"
            title="A portfolio structure that already feels considered."
            description="Placeholder case studies are presented with the same visual rigor the future real work will use."
          />
          <div className="project-grid">
            {portfolioProjects.slice(0, 3).map((project) => (
              <Reveal key={project.name} className="project-card panel">
                <div className="project-card__visual" style={{ background: project.accent }} />
                <div className="project-card__meta">
                  <span className="eyebrow">{project.category}</span>
                  <div className="project-card__header">
                    <h3>{project.name}</h3>
                    <ArrowUpRight size={16} />
                  </div>
                  <p>{project.goal}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="section-action">
            <Button to="/portfolio" variant="secondary">
              View Portfolio
            </Button>
          </div>
        </div>
      </section>

      <section className="section section--contrast">
        <div className="container pricing-teaser">
          <Reveal className="panel pricing-teaser__card">
            <span className="eyebrow">Engagement Model</span>
            <h2>Two sides. One clean relationship.</h2>
            <p>
              Website creation is handled as a focused design and build engagement. Ongoing upkeep is handled through a simple monthly support structure for edits, updates, and continued refinement.
            </p>
          </Reveal>
          <Reveal className="pricing-teaser__aside">
            <p>
              You do not need one team to build the site and another team to keep it current. WilksMedia handles both.
            </p>
            <Link to="/quote" className="inline-link">
              Tell us what you need
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section final-cta">
        <div className="container final-cta__inner panel">
          <div>
            <span className="eyebrow">Start Here</span>
            <h2>Need a website that actually feels premium?</h2>
            <p>Let�s build something that looks better, works harder, and stays supported after launch.</p>
          </div>
          <Button to="/quote">Start Your Site</Button>
        </div>
      </section>
    </>
  );
}
