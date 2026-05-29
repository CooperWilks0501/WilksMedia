import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring
} from "framer-motion";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../common/Button";
import { heroMetrics } from "../../data/siteContent";

const panelRows = Array.from({ length: 5 }, (_, index) => index);

export function HomeHero() {
  const shouldReduceMotion = useReducedMotion();
  const [interactive, setInteractive] = useState(false);
  const frameRef = useRef<number | null>(null);
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const rotateX = useSpring(0, { stiffness: 80, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 80, damping: 18 });
  const glowX = useSpring(x, { stiffness: 120, damping: 20 });
  const glowY = useSpring(y, { stiffness: 120, damping: 20 });

  const background = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(234,124,37,0.18), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.85), rgba(241,236,227,0.72) 34%, rgba(17,17,19,0.94) 100%)`;
  const transform = useMotionTemplate`perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const technicalLabels = useMemo(
    () => ["System / Premium Web", "Motion / Reactive", "Support / Ongoing"],
    []
  );

  useEffect(() => {
    if (shouldReduceMotion) {
      setInteractive(false);
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const updateInteractive = () => setInteractive(mediaQuery.matches);

    updateInteractive();
    mediaQuery.addEventListener("change", updateInteractive);

    return () => {
      mediaQuery.removeEventListener("change", updateInteractive);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [shouldReduceMotion]);

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    if (!interactive) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      x.set(px);
      y.set(py);
      rotateX.set((50 - py) / 12);
      rotateY.set((px - 50) / 14);
    });
  };

  const resetPointer = () => {
    if (!interactive) {
      return;
    }

    rotateX.set(0);
    rotateY.set(0);
    x.set(50);
    y.set(50);
  };

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
          onMouseMove={interactive ? handlePointerMove : undefined}
          onMouseLeave={interactive ? resetPointer : undefined}
          style={{ background, transform: interactive ? transform : "none" }}
        >
          <div className="hero-visual__grid" />
          <div className="hero-visual__scan" />
          <div className="hero-visual__panel hero-visual__panel--primary">
            <span className="hero-visual__code">BM // SYSTEM 01</span>
            <strong>Premium web presence</strong>
            <p>Angular structure, modern motion, precise hierarchy.</p>
          </div>
          <div className="hero-visual__panel hero-visual__panel--secondary">
            <span className="hero-visual__code">BUILD / SUPPORT</span>
            <strong>One studio. Full lifecycle.</strong>
          </div>
          <div className="hero-visual__stripes" />
          <div className="hero-visual__crosshair" />
          <div className="hero-visual__labels">
            {technicalLabels.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="hero-visual__stack">
            {panelRows.map((row) => (
              <motion.div
                key={row}
                className="hero-visual__bar"
                animate={
                  interactive && !shouldReduceMotion
                    ? { x: row % 2 === 0 ? [0, 8, 0] : [0, -6, 0] }
                    : { x: 0 }
                }
                transition={
                  interactive && !shouldReduceMotion
                    ? { duration: 10 + row, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0 }
                }
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
