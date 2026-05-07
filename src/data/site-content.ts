import type {
  CaseStudy,
  HomePage,
  SiteSettings,
  WritingPost,
} from "@/types/content";

export const siteSettings: SiteSettings = {
  title: "Ripe Studios",
  description:
    "Creative technology, motion systems, and editorial infrastructure for ambitious brand storytelling.",
  nav: [
    { label: "Case Studies", href: "/case-studies" },
    { label: "Writing", href: "/writing" },
    { label: "Studio", href: "/studio" },
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
    src: "https://vz-6a7f17ce.b-cdn.net/sample-hls/playlist.m3u8",
    poster:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
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

export const caseStudies: CaseStudy[] = [
  {
    title: "Zetachain Launch System",
    slug: "zetachain-launch-system",
    client: "Zetachain",
    summary:
      "Rebuilt launch storytelling into a modular content system with dense motion, deliberate pacing, and saner publishing primitives.",
    year: "2026",
    tags: ["Launch", "Editorial", "Motion"],
    featured: true,
    theme: "ember",
    coverMedia: {
      kind: "image",
      src: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=80",
      alt: "Warm-toned motion frames pinned across a production wall",
      eyebrow: "Featured Case Study",
    },
    challenge:
      "The previous page logic depended on DOM scraping and route-specific script loading, which made every change slower and riskier than it should have been.",
    outcome:
      "The rebuilt page model turns content rows into typed data, making rich case-study layouts editable without repeating brittle script branches.",
    metrics: [
      {
        label: "Template layers removed",
        value: "4",
        detail: "Loader branches collapsed into route components",
      },
      {
        label: "Canonical content source",
        value: "1",
        detail: "Sanity document replaces DOM parsing",
      },
      {
        label: "Preview latency target",
        value: "<60s",
        detail: "ISR and on-demand revalidation enabled",
      },
    ],
    sections: [
      {
        title: "What needed to change",
        paragraphs: [
          "The goal was not to flatten the visual ambition. It was to remove the hidden dependencies that made the experience hard to extend.",
          "We translated each content row into structured fields so the layout could stay expressive while the implementation became predictable."
        ],
        quote:
          "Treat the Webflow build as a reference artifact, not as the system you are preserving."
      },
      {
        title: "What the new stack unlocks",
        paragraphs: [
          "Editors can work with previews and draft mode instead of publishing into a black box.",
          "Developers can ship new sections and interaction variants as reusable React components rather than one-off route scripts."
        ]
      }
    ],
    seo: {
      title: "Zetachain Launch System | Ripe Studios",
      description:
        "A typed, preview-friendly case-study rebuild that preserves visual ambition while removing route-bound loader code.",
    },
  },
  {
    title: "Atlas Brand Portal",
    slug: "atlas-brand-portal",
    client: "Atlas",
    summary:
      "Turned an ad-hoc marketing archive into a polished publishing system with a flexible writing feed and clearer content governance.",
    year: "2026",
    tags: ["CMS", "Content Design", "Publishing"],
    featured: true,
    theme: "moss",
    coverMedia: {
      kind: "image",
      src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
      alt: "Editorial workspace with notebooks, proofs, and photo contact sheets",
      eyebrow: "Content Migration",
    },
    challenge:
      "Writing archives and featured work collections were wired together through classes and DOM assumptions instead of clear data contracts.",
    outcome:
      "The migration establishes one content model for editorial pages, richer metadata, and clean URLs that can survive future redesigns.",
    metrics: [
      {
        label: "Content types defined",
        value: "6",
        detail: "Core documents and media wrappers modeled in Sanity",
      },
      {
        label: "Fallback routes preserved",
        value: "100%",
        detail: "Redirect strategy baked into launch planning",
      },
      {
        label: "Smoke checks",
        value: "5",
        detail: "Critical pages covered in CI",
      },
    ],
    sections: [
      {
        title: "A calmer editorial system",
        paragraphs: [
          "Instead of copying a visual shell forward, the new model starts from structure: titles, excerpts, authorship, dates, and reusable content sections.",
          "That content model gives the frontend enough shape to produce bold layouts without relying on mystery markup."
        ]
      },
      {
        title: "Operational payoff",
        paragraphs: [
          "Preview deployments and draft mode give stakeholders a safer review loop.",
          "On-demand revalidation means editorial updates no longer wait on a full rebuild."
        ]
      }
    ],
    seo: {
      title: "Atlas Brand Portal | Ripe Studios",
      description:
        "Editorial system migration for a writing-heavy marketing site, rebuilt on structured content and clean route conventions.",
    },
  },
];

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
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
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
      src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80",
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
