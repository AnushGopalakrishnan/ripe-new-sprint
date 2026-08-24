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
