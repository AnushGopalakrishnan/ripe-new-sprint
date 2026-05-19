export type WorkJournalItem = {
  title: string;
  slug: string;
  description: string;
  industry: string;
  image: string;
  coverMedia?: {
    kind: "image" | "video";
    src: string;
    alt: string;
    poster?: string;
  };
  tags: string[];
  year: string;
  accentColor?: string;
};

export const workJournalFilters = [
  "Strategy",
  "Identity",
  "Motion",
  "Web Design",
  "Brand Extensions",
];

export const workJournalItems: WorkJournalItem[] = [
  {
    title: "Sticky Notes",
    slug: "case-study-20",
    description: "A Cape Town stay full of personality.",
    industry: "Hospitality",
    image: "/work-media/sticky-notes.png",
    tags: ["Brand Extensions", "Strategy"],
    year: "2026",
    accentColor: "#4e3aaa",
  },
  {
    title: "ZetaChain",
    slug: "zetachain",
    description: "A South African icon.",
    industry: "Technology",
    image: "/work-media/zetachain.png",
    tags: ["Identity", "Motion", "Strategy", "Brand Extensions"],
    year: "2026",
    accentColor: "#0d7c5f",
  },
  {
    title: "Volvo",
    slug: "case-study-19",
    description: "A South African icon.",
    industry: "Automotive",
    image: "/work-media/volvo.png",
    tags: ["Web Design", "Motion"],
    year: "2025",
    accentColor: "#798b98",
  },
  {
    title: "Polaris",
    slug: "case-study-18",
    description: "Cold comfort, a style guide for convalescence.",
    industry: "Wellness",
    image: "/work-media/polaris.png",
    tags: ["Brand Extensions"],
    year: "2025",
    accentColor: "#2d3436",
  },
  {
    title: "Mira",
    slug: "case-study-17",
    description: "A Cape Town stay full of personality.",
    industry: "Travel",
    image: "/work-media/mira.png",
    tags: ["Brand Extensions"],
    year: "2024",
    accentColor: "#e17055",
  },
  {
    title: "Reuter",
    slug: "case-study-15",
    description: "Inside the artist's atelier on the Greek island.",
    industry: "Arts",
    image: "/work-media/reuter.png",
    tags: ["Identity"],
    year: "2024",
    accentColor: "#b2bec3",
  },
  {
    title: "Oum Ceramics",
    slug: "case-study-14",
    description: "Material language for a ceramic studio.",
    industry: "Homeware",
    image: "/work-media/oum-ceramics.png",
    tags: ["Identity", "Web Design"],
    year: "2023",
    accentColor: "#a29bfe",
  },
  {
    title: "Avantis",
    slug: "case-study-13",
    description: "Designing a world for cross-chain experiences.",
    industry: "Finance",
    image: "/work-media/avantis.png",
    tags: ["Identity"],
    year: "2023",
    accentColor: "#636e72",
  },
  {
    title: "AlphaTauri",
    slug: "case-study-12",
    description: "Designing a world for the future of cross-chain experiences.",
    industry: "Fashion",
    image: "/work-media/alphatauri.png",
    tags: ["Identity"],
    year: "2022",
    accentColor: "#2d3436",
  },
  {
    title: "Isar",
    slug: "case-study-11",
    description: "Designing a world for the future of cross-chain experiences.",
    industry: "Culture",
    image: "/work-media/isar.png",
    tags: ["Identity"],
    year: "2022",
    accentColor: "#3d5a80",
  },
  {
    title: "Tabletop",
    slug: "case-study-10",
    description: "A tabletop identity system with motion in reserve.",
    industry: "Product",
    image: "/work-media/tabletop.png",
    tags: ["Identity", "Motion", "Strategy"],
    year: "2022",
    accentColor: "#6c5ce7",
  },
  {
    title: "Redbull",
    slug: "case-study-9",
    description: "An identity and motion system for high-velocity culture.",
    industry: "Energy",
    image: "/work-media/redbull.png",
    tags: ["Motion", "Identity", "Strategy"],
    year: "2022",
    accentColor: "#c0392b",
  },
];
