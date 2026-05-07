export type Seo = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type MediaAsset = {
  kind: "image" | "video";
  src: string;
  alt: string;
  poster?: string;
  eyebrow?: string;
};

export type StorySection = {
  title: string;
  paragraphs: string[];
  quote?: string;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type SiteSettings = {
  title: string;
  description: string;
  nav: NavLink[];
  footerNav: NavLink[];
  socialLinks?: SocialLink[];
  contactEmail?: string;
  location?: string;
  seo: Seo;
};

export type HomeStat = {
  value: string;
  label: string;
};

export type HomePage = {
  eyebrow: string;
  title: string;
  summary: string;
  supportingCopy: string;
  primaryCta: NavLink;
  secondaryCta: NavLink;
  heroMedia: MediaAsset;
  featuredStudySlugs: string[];
  featuredWritingSlugs: string[];
  stats: HomeStat[];
  marquee: string[];
  seo: Seo;
};

export type CaseStudy = {
  title: string;
  slug: string;
  client: string;
  summary: string;
  year?: string;
  tags: string[];
  featured: boolean;
  theme?: "ember" | "moss";
  coverMedia: MediaAsset;
  order?: number;
  accentColor?: string;
  accentColorText?: string;
  challenge?: string;
  outcome?: string;
  metrics: Metric[];
  sections: StorySection[];
  testimonial?: {
    quote?: string;
    name?: string;
    role?: string;
    company?: string;
    avatar?: MediaAsset;
    insertAfterOrder?: number;
  };
  seo: Seo;
};

export type WritingPost = {
  title: string;
  slug: string;
  excerpt: string;
  eyebrow?: string;
  author?: string;
  authorRole?: string;
  authorBio?: string;
  authorImage?: MediaAsset;
  publishDate?: string;
  publishLabel?: string;
  category?: string;
  readTime?: string;
  coverMedia: MediaAsset;
  body: StorySection[];
  bodyHtml?: string;
  seo: Seo;
};
