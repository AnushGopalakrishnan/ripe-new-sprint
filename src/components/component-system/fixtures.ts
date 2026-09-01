import type { WorkJournalItem } from "@/data/work-journal";
import type { JobPosting, NavLink, SocialLink } from "@/types/content";

export const specimenNav: NavLink[] = [
  { label: "Work", href: "/case-studies" },
  { label: "Writing", href: "/writing" },
  { label: "Team", href: "/team" },
  { label: "Careers", href: "/careers" },
];

export const specimenSocials: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export const specimenRoles: JobPosting[] = [
  { title: "Example role", location: "Remote", contractType: "Full time", externalUrl: "#role-specimen" },
  { title: "Example contract role", location: "Remote", contractType: "Contract", externalUrl: "#role-specimen" },
];

export const specimenWork: WorkJournalItem[] = [
  {
    title: "Polaris",
    slug: "polaris",
    description: "Local specimen content for the production work-journal component.",
    industry: "Technology",
    image: "/work-media/polaris.png",
    tags: ["Strategy", "Identity"],
    year: "2026",
    accentColor: "#4b61d1",
  },
  {
    title: "ZetaChain",
    slug: "zetachain",
    description: "Local specimen content for the production work-journal component.",
    industry: "Web3",
    image: "/work-media/zetachain.png",
    tags: ["Identity", "Motion", "Web Design"],
    year: "2025",
    accentColor: "#005741",
  },
  {
    title: "Sticky Notes",
    slug: "sticky-notes",
    description: "Local specimen content for the production work-journal component.",
    industry: "Software",
    image: "/work-media/sticky-notes.png",
    tags: ["Strategy", "Web Design"],
    year: "2025",
    accentColor: "#f4b800",
  },
  {
    title: "Avantis",
    slug: "avantis",
    description: "Local specimen content for the production work-journal component.",
    industry: "Finance",
    image: "/work-media/avantis.png",
    tags: ["Identity", "Motion"],
    year: "2024",
    accentColor: "#232323",
  },
];
