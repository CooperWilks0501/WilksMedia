import { motion } from "framer-motion";
import { Button } from "../common/Button";
import { heroMetrics } from "../../data/siteContent";

export function HomeHero() {
  return (
    <section className="hero">
      <div className="container hero__layout">
        <div className="hero__copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Premium Design Studio / Website Creation + Upkeep
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.05 }}
          >
            Websites built to look sharper and sell more clearly.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12 }}
          >
            WilksMedia designs and builds premium websites with modern frontend execution, then keeps them maintained through a simple ongoing upkeep model.
          </motion.p>
          <motion.p
            className="hero__mission"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.18 }}
          >
            WilksMedia builds modern, high-performing websites that make brands look sharper, sell more clearly, and stay maintained long after launch.
          </motion.p>
          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.24 }}
          >
            <Button to="/quote">Get a Quote</Button>
            <Button to="/services" variant="secondary">
              View Services
            </Button>
          </motion.div>

          <motion.div
            className="hero__metrics"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3 }}
          >
            {heroMetrics.map((metric) => (
              <div key={metric.value} className="metric-tile">
                <span>{metric.value}</span>
                <small>{metric.label}</small>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <div className="hero-visual__glass hero-visual__glass--primary">
            <span className="hero-visual__code">WM // SYSTEM 01</span>
            <strong>Premium web presence</strong>
            <p>Angular structure, modern motion, precise hierarchy.</p>
          </div>
          <div className="hero-visual__glass hero-visual__glass--secondary">
            <span className="hero-visual__code">BUILD / SUPPORT</span>
            <strong>One studio. Full lifecycle.</strong>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
