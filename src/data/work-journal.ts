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
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69f0af619f6562c28e13226b_69934c1a5f86d6aad049147c_Div%2520%255Bintrinsic-image%255D-4.png",
    tags: ["Brand Extensions", "Strategy"],
    year: "2026",
    accentColor: "#4e3aaa",
  },
  {
    title: "ZetaChain",
    slug: "zetachain",
    description: "A South African icon.",
    industry: "Technology",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69972ef28c6957359c359dc4_zetachain.png",
    tags: ["Identity", "Motion", "Strategy", "Brand Extensions"],
    year: "2026",
    accentColor: "#0d7c5f",
  },
  {
    title: "Volvo",
    slug: "case-study-19",
    description: "A South African icon.",
    industry: "Automotive",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad0491469_image%202-1.png",
    tags: ["Web Design", "Motion"],
    year: "2025",
    accentColor: "#798b98",
  },
  {
    title: "Polaris",
    slug: "case-study-18",
    description: "Cold comfort, a style guide for convalescence.",
    industry: "Wellness",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad0491465_image%203.png",
    tags: ["Brand Extensions"],
    year: "2025",
    accentColor: "#2d3436",
  },
  {
    title: "Mira",
    slug: "case-study-17",
    description: "A Cape Town stay full of personality.",
    industry: "Travel",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad049145b_image%202-4.png",
    tags: ["Brand Extensions"],
    year: "2024",
    accentColor: "#e17055",
  },
  {
    title: "Reuter",
    slug: "case-study-15",
    description: "Inside the artist's atelier on the Greek island.",
    industry: "Arts",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad0491463_image%2043351-1.png",
    tags: ["Identity"],
    year: "2024",
    accentColor: "#b2bec3",
  },
  {
    title: "Oum Ceramics",
    slug: "case-study-14",
    description: "Material language for a ceramic studio.",
    industry: "Homeware",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad049145d_image%202-2.png",
    tags: ["Identity", "Web Design"],
    year: "2023",
    accentColor: "#a29bfe",
  },
  {
    title: "Avantis",
    slug: "case-study-13",
    description: "Designing a world for cross-chain experiences.",
    industry: "Finance",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad0491475_image%2043352-2.png",
    tags: ["Identity"],
    year: "2023",
    accentColor: "#636e72",
  },
  {
    title: "AlphaTauri",
    slug: "case-study-12",
    description: "Designing a world for the future of cross-chain experiences.",
    industry: "Fashion",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad049145e_image%2043352.png",
    tags: ["Identity"],
    year: "2022",
    accentColor: "#2d3436",
  },
  {
    title: "Isar",
    slug: "case-study-11",
    description: "Designing a world for the future of cross-chain experiences.",
    industry: "Culture",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad0491468_image%2043352-1.png",
    tags: ["Identity"],
    year: "2022",
    accentColor: "#3d5a80",
  },
  {
    title: "Tabletop",
    slug: "case-study-10",
    description: "A tabletop identity system with motion in reserve.",
    industry: "Product",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad0491467_image%202-3.png",
    tags: ["Identity", "Motion", "Strategy"],
    year: "2022",
    accentColor: "#6c5ce7",
  },
  {
    title: "Redbull",
    slug: "case-study-9",
    description: "An identity and motion system for high-velocity culture.",
    industry: "Energy",
    image:
      "https://cdn.prod.website-files.com/69934c1a5f86d6aad04912f4/69934c1a5f86d6aad0491474_image%2043351-2.png",
    tags: ["Motion", "Identity", "Strategy"],
    year: "2022",
    accentColor: "#c0392b",
  },
];
