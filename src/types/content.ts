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

export type CommentPosition = {
  x?: number;
  y?: number;
};

export type PlacedComment = {
  _key?: string;
  author?: string;
  commenter?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
  body?: string;
  position?: CommentPosition;
};

export type CommentableMedia = {
  media?: MediaAsset;
  comments?: PlacedComment[];
};

export type DetailLayoutCell = {
  _key?: string;
  width?: number;
  content?: CommentableMedia;
};

export type DetailLayoutRow = {
  _key?: string;
  height?: number;
  cells?: DetailLayoutCell[];
};

export type DetailLayoutBlock = {
  _key?: string;
  preset?: "layout1" | "layout2" | "layout3" | "layout4" | "layout5" | "layout6";
  gap?: number;
  rows?: DetailLayoutRow[];
};

export type CaseStudyLayoutTemplate = {
  _id?: string;
  title?: string;
  preset?: "layout1" | "layout2" | "layout3" | "layout4" | "layout5" | "layout6";
  designWidth?: number;
  gap?: number;
  rows?: DetailLayoutRow[];
};

export type DetailLayoutEntry = {
  _key?: string;
  layout?: CaseStudyLayoutTemplate;
  content?: CommentableMedia[];
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
  detailEyebrow?: string;
  detailServices?: Array<string | { _ref?: string; _type?: string; title?: string }>;
  detailServiceTitles?: string[];
  detailServiceRefs?: string[];
  detailServiceItems?: Array<{ _type?: string; _ref?: string; title?: string }>;
  detailIndustry?: string;
  detailInformation?: string[];
  detailLayouts?: DetailLayoutBlock[];
  detailLayoutEntries?: DetailLayoutEntry[];
  detailHero?: CommentableMedia;
  detailIntro?: CommentableMedia;
  detailCarouselSlides?: CommentableMedia[];
  detailCarouselPoster?: CommentableMedia;
  detailBlackFeature?: CommentableMedia;
  detailWideFeature?: CommentableMedia;
  detailCta?: CommentableMedia;
  detailMoreProjects?: Array<{
    _key?: string;
    title?: string;
    year?: string;
    slug?: string;
    media?: MediaAsset;
  }>;
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
