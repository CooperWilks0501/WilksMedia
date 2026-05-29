import { Brush, Code2, Rocket, ShieldCheck, Gauge, PenSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ServiceItem = {
  title: string;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
};

export type ProcessStep = {
  index: string;
  title: string;
  description: string;
};

export type ProjectItem = {
  name: string;
  category: string;
  goal: string;
  tags: string[];
  accent: string;
  image: string;
  url: string;
  summary: string;
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Quote", href: "/quote" }
];

export const heroMetrics = [
  { value: "Custom", label: "Designed around your brand" },
  { value: "Motion-led", label: "Modern frontend presentation" },
  { value: "Ongoing", label: "Upkeep built into the model" }
];

export const serviceHighlights: ServiceItem[] = [
  {
    eyebrow: "01 / Design",
    title: "Custom Website Design",
    description: "Premium visual systems, sharp messaging, and layouts that make the brand feel established from the first scroll.",
    icon: Brush
  },
  {
    eyebrow: "02 / Build",
    title: "Frontend Development",
    description: "Responsive React-based builds with clean structure, thoughtful motion, and a polished feel across every breakpoint.",
    icon: Code2
  },
  {
    eyebrow: "03 / Launch",
    title: "Launch & Setup",
    description: "Structured handoff, deployment support, and production-ready setup so the site feels considered before it goes live.",
    icon: Rocket
  },
  {
    eyebrow: "04 / Upkeep",
    title: "Ongoing Website Support",
    description: "Monthly upkeep for edits, updates, performance checks, and continuous refinement after launch.",
    icon: ShieldCheck
  }
];

export const extendedServices: ServiceItem[] = [
  {
    eyebrow: "Service / 01",
    title: "Responsive Design Systems",
    description: "Interfaces shaped for desktop, tablet, and mobile with strong hierarchy and clean reading flow.",
    icon: PenSquare
  },
  {
    eyebrow: "Service / 02",
    title: "Landing Pages & Business Sites",
    description: "Focused pages and full marketing sites designed to present the offer clearly and move visitors to action.",
    icon: Brush
  },
  {
    eyebrow: "Service / 03",
    title: "Redesign & Modernization",
    description: "Sharper structure, cleaner visual identity, and a more current frontend experience when an existing site feels behind.",
    icon: Code2
  },
  {
    eyebrow: "Service / 04",
    title: "Performance-Minded Builds",
    description: "Animation and visual polish handled with restraint so the site feels alive without becoming heavy.",
    icon: Gauge
  },
  {
    eyebrow: "Service / 05",
    title: "Updates & Content Support",
    description: "Post-launch edits, seasonal updates, service changes, and routine refinements handled through a simple ongoing model.",
    icon: ShieldCheck
  }
];

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Discover",
    description: "Clarify the brand, audience, offer, and what the site needs to do."
  },
  {
    index: "02",
    title: "Design",
    description: "Shape the visual system, messaging hierarchy, and interaction language."
  },
  {
    index: "03",
    title: "Build",
    description: "Develop the experience with responsive precision and premium motion."
  },
  {
    index: "04",
    title: "Launch",
    description: "Deploy cleanly, test the experience, and prepare the site for live traffic."
  },
  {
    index: "05",
    title: "Maintain",
    description: "Keep the site current through updates, support, and ongoing refinement."
  }
];

export const differentiators = [
  "Custom builds instead of recycled templates",
  "Premium visual direction with technical precision",
  "One studio handling both launch and long-term upkeep",
  "Modern frontend execution with tasteful animation",
  "Clear process, clear scope, and a clean service model"
];

export const portfolioProjects: ProjectItem[] = [
  {
    name: "MHC MGA",
    category: "Managing General Agency",
    goal: "A sharper digital presence for a managing general agency focused on transportation, built to communicate trust, underwriting clarity, and a more current brand presentation.",
    tags: ["Insurance", "Corporate", "Trust"],
    accent: "linear-gradient(135deg, rgba(26,27,31,0.95), rgba(234,124,37,0.52))",
    image: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.mhcmga.com?w=1600",
    url: "https://mhcmga.com",
    summary: "A transportation-focused managing general agency website with a cleaner information hierarchy, clearer underwriting message, and a more credible visual presentation for agency partners."
  },
  {
    name: "Commodore Trucking Insurance",
    category: "Commercial Trucking Insurance",
    goal: "A modernized insurance website for a trucking-focused business, designed to feel more established, easier to navigate, and clearer about coverage direction.",
    tags: ["Trucking", "Insurance", "Lead Gen"],
    accent: "linear-gradient(135deg, rgba(241,236,227,0.95), rgba(22,22,24,0.85))",
    image: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fcommodorerrg.com%2F?w=1600",
    url: "https://commodorerrg.com/",
    summary: "A commercial trucking insurance site built to present coverage more confidently, guide visitors more cleanly, and create a stronger first impression for prospective insureds."
  },
  {
    name: "Jack Finn Craftsman",
    category: "Home Renovation & Fine Finish",
    goal: "A craftsman-forward portfolio site for a home renovation and fine finish carpentry business, designed to present the work with the same care and precision as the millwork itself.",
    tags: ["Renovation", "Craftsmanship", "Residential"],
    accent: "linear-gradient(135deg, rgba(58,42,28,0.95), rgba(184,134,76,0.55))",
    image: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fcooperwilks0501.github.io%2FJackFinnCraftsman%2F?w=1600",
    url: "https://cooperwilks0501.github.io/JackFinnCraftsman/",
    summary: "A residential renovation and fine finish carpentry site built around clear project showcases, a calm visual tone, and a confident craftsman presentation that lets the work speak for itself."
  },
  {
    name: "Palmetto Consulting",
    category: "Business Consulting",
    goal: "A polished consulting website for a Columbia-based advisory firm, designed to communicate seasoned expertise, local credibility, and a confident presentation for prospective clients.",
    tags: ["Consulting", "Professional Services", "Local Business"],
    accent: "linear-gradient(135deg, rgba(20,40,72,0.95), rgba(212,184,150,0.55))",
    image: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fpalmettoconsulting.us%2F?w=1600",
    url: "https://palmettoconsulting.us/",
    summary: "A Columbia-based business consulting site built to project measured authority, clarify the firm's service direction, and create a polished first impression for decision-makers evaluating advisory partners."
  }
];

export const contactPlaceholders = {
  email: "cooper@wilksmedia.com",
  instagram: "@wilksmedia",
  note: "Replace placeholder contact details with the final business information before launch."
};

