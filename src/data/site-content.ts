import type {
  HomePage,
  SiteSettings,
  WritingPost,
} from "@/types/content";

export const siteSettings: SiteSettings = {
  title: "Ripe Studios",
  description:
    "Creative technology, motion systems, and editorial infrastructure for ambitious brand storytelling.",
  nav: [
    { label: "Work", href: "/case-studies" },
    { label: "Services", href: "/services" },
    { label: "Writing", href: "/writing" },
    { label: "Team", href: "/team" },
    { label: "Careers", href: "/careers" },
  ],
  footerNav: [
    { label: "Home", href: "/" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Writing", href: "/writing" },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
  contactEmail: "hello@ripe.studio",
  navigationShowreel: {
    title: "Ripe Showreel 2026",
    video: {
      kind: "video",
      src: "/feed-media/polestar.mp4",
      alt: "Ripe showreel video",
    },
  },
  location: "Remote-first, working across APAC, Europe, and North America",
  seo: {
    title: "Ripe Studios",
    description:
      "Custom marketing websites, visual systems, and content operations for brands that want more than templates.",
  },
};

export const homePage: HomePage = {
  eyebrow: "Creative Systems For Story-Led Brands",
  title: "Web experiences that feel cinematic without becoming fragile.",
  summary:
    "This scaffold replaces the Webflow runtime stack with a source-controlled Next.js and Sanity foundation built for editorial control, preview workflows, and interaction-heavy marketing pages.",
  supportingCopy:
    "The current implementation ships a strong visual point of view, but the architecture is brittle. This rebuild keeps the ambition while moving the site onto typed content, first-class routes, and deliberate media components.",
  primaryCta: { label: "Explore Case Studies", href: "/case-studies" },
  secondaryCta: { label: "Read The Writing Feed", href: "/writing" },
  heroMedia: {
    kind: "video",
    src: "/case-detail-media/feature.mp4",
    poster: "/case-detail-media/hero.jpg",
    alt: "Team workshop surrounded by wall-sized motion boards",
    eyebrow: "Motion-ready media component",
  },
  featuredStudySlugs: ["zetachain-launch-system", "atlas-brand-portal"],
  featuredWritingSlugs: ["moving-beyond-webflow-loaders", "content-model-first-marketing-sites"],
  stats: [
    { value: "ISR", label: "Preview-ready publishing model" },
    { value: "RSC", label: "Server-first rendering defaults" },
    { value: "1", label: "Embedded Sanity Studio route" },
  ],
  marquee: [
    "Next.js App Router",
    "Sanity Visual Editing",
    "Bunny Video",
    "Typed Routes",
    "Reusable Media Player",
    "Preview Deployments",
  ],
  seo: {
    title: "Ripe Studios | Migration Scaffold",
    description:
      "A custom Next.js and Sanity scaffold for migrating the Ripe Studios marketing site away from Webflow runtime scripts.",
  },
};

export const writingPosts: WritingPost[] = [
  {
    title: "Moving Beyond Webflow Loaders",
    slug: "moving-beyond-webflow-loaders",
    excerpt:
      "Loader scripts feel fast until they become the hidden architecture. The migration path is to move behavior to route boundaries and typed components.",
    author: "Ripe Studios",
    publishDate: "2026-05-01",
    category: "Engineering",
    readTime: "6 min read",
    coverMedia: {
      kind: "image",
      src: "/case-detail-media/intro.jpg",
      alt: "Laptop showing animation timing frames and code side by side",
      eyebrow: "Engineering Note",
    },
    body: [
      {
        title: "Why loader-heavy sites decay",
        paragraphs: [
          "When route logic lives in global scripts, every new page inherits invisible coupling. That is manageable for one or two landing pages, but it compounds fast once publishing becomes regular.",
          "App Router pushes the opposite shape: route-local code, explicit data fetching, and component boundaries that describe what a page actually needs."
        ]
      },
      {
        title: "What replaces the loader",
        paragraphs: [
          "The answer is not one mega layout. It is thin route files, a reusable media layer, and typed content models that can render rich sections directly.",
          "That makes the frontend easier to reason about and the CMS easier to evolve."
        ],
        quote:
          "The migration target should make the next redesign cheaper, not just recreate the current one in a different stack."
      }
    ],
    seo: {
      title: "Moving Beyond Webflow Loaders",
      description:
        "Why route-bound scripts should be replaced with App Router components and typed content models.",
    },
  },
  {
    title: "Content Model First Marketing Sites",
    slug: "content-model-first-marketing-sites",
    excerpt:
      "Most migration risk comes from rebuilding presentation before defining the content. Modeling the system first produces better routes, previews, and redirects.",
    author: "Ripe Studios",
    publishDate: "2026-04-18",
    category: "Content Ops",
    readTime: "5 min read",
    coverMedia: {
      kind: "image",
      src: "/case-detail-media/wide-feature.jpg",
      alt: "Printed editorial layouts spread across a large desk",
      eyebrow: "Content Systems",
    },
    body: [
      {
        title: "Model the truth before the UI",
        paragraphs: [
          "A migration that starts by copying markup tends to preserve the wrong abstractions. A migration that starts with content types can still recover the look later, but with better interfaces.",
          "Case studies, writing posts, people, and media wrappers are not implementation details. They are the durable language of the site."
        ]
      },
      {
        title: "Why this matters later",
        paragraphs: [
          "Strong schemas make visual editing and revalidation far easier to wire correctly.",
          "They also make it possible to launch clean canonical URLs without losing the route history of the legacy site."
        ]
      }
    ],
    seo: {
      title: "Content Model First Marketing Sites",
      description:
        "Why content modeling should lead a marketing-site migration instead of following the visual rebuild.",
    },
  },
];
