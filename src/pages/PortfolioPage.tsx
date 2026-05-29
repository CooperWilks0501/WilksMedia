import { ArrowUpRight } from "lucide-react";
import { Button } from "../components/common/Button";
import { Reveal } from "../components/common/Reveal";
import { PageHero } from "../components/sections/PageHero";
import { portfolioProjects } from "../data/siteContent";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export function PortfolioPage() {
  useDocumentMeta(
    "Portfolio — WilksMedia Web Design Projects",
    "Live client work from WilksMedia: small-business websites and web applications including 911 Lost Dog, MHC MGA, Commodore Trucking, Jack Finn Craftsman, and Palmetto Consulting."
  );
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Live work with a cleaner, more credible web presence."
        description="A focused portfolio of real client projects built to improve clarity, presentation, and trust at first glance."
        aside={
          <>
            <span className="eyebrow">Selected Projects</span>
            <p>Each project below reflects live work, with the top cards showing actual website screenshots and the lower section outlining the business context more clearly.</p>
          </>
        }
      />

      <section className="section">
        <div className="container portfolio-grid">
          {portfolioProjects.map((project) => (
            <Reveal key={project.name} className="portfolio-card panel">
              <a href={project.url} target="_blank" rel="noreferrer" className="portfolio-card__visual">
                <img src={project.image} alt={`${project.name} website preview`} loading="lazy" />
                <div className="portfolio-card__overlay">
                  <span>{project.category}</span>
                  <ArrowUpRight size={18} />
                </div>
              </a>
              <div className="portfolio-card__body">
                <h2>{project.name}</h2>
                <p>{project.goal}</p>
                <div className="tag-row">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--contrast">
        <div className="container case-grid">
          {portfolioProjects.map((project, index) => (
            <Reveal key={project.name} className="panel case-preview">
              <span className="eyebrow">Project / 0{index + 1}</span>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
              <div className="tag-row">
                <span>{project.category}</span>
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section final-cta">
        <div className="container final-cta__inner panel">
          <div>
            <span className="eyebrow">Have A Project?</span>
            <h2>Let’s make your brand look more established online.</h2>
            <p>WilksMedia builds premium digital experiences that are easier to trust at first glance.</p>
          </div>
          <Button to="/quote">Start a Project</Button>
        </div>
      </section>
    </>
  );
}
