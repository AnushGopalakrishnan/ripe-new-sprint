import { defineQuery } from "next-sanity";

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    title,
    description,
    nav[]{
      label,
      href
    },
    footerNav[]{
      label,
      href
    },
    socialLinks[]{
      label,
      href
    },
    contactEmail,
    location,
    seo{
      title,
      description,
      ogTitle,
      ogDescription
    }
  }
`);

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0]{
    eyebrow,
    title,
    summary,
    supportingCopy,
    primaryCta{
      label,
      href
    },
    secondaryCta{
      label,
      href
    },
    heroMedia{
      kind,
      src,
      alt,
      poster,
      eyebrow
    },
    "featuredStudySlugs": featuredCaseStudies[]->slug.current,
    "featuredWritingSlugs": featuredWriting[]->slug.current,
    stats[]{
      value,
      label
    },
    marquee,
    seo{
      title,
      description,
      ogTitle,
      ogDescription
    }
  }
`);

const CASE_STUDY_FIELDS = `
  title,
  "slug": slug.current,
  client,
  summary,
  year,
  order,
  accentColor,
  accentColorText,
  "tags": tags[]->title,
  featured,
  theme,
  coverMedia{
    kind,
    src,
    alt,
    poster,
    eyebrow
  },
  challenge,
  outcome,
  metrics[]{
    label,
    value,
    detail
  },
  sections[]{
    title,
    paragraphs,
    quote
  },
  testimonial{
    quote,
    name,
    role,
    company,
    insertAfterOrder,
    avatar{
      kind,
      src,
      alt,
      poster,
      eyebrow
    }
  },
  seo{
    title,
    description,
    ogTitle,
    ogDescription
  }
`;

export const CASE_STUDIES_QUERY = defineQuery(`
  *[_type == "caseStudy" && defined(slug.current)] | order(featured desc, year desc){
    ${CASE_STUDY_FIELDS}
  }
`);

export const CASE_STUDY_QUERY = defineQuery(`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    ${CASE_STUDY_FIELDS}
  }
`);

export const CASE_STUDY_SLUGS_QUERY = defineQuery(`
  *[_type == "caseStudy" && defined(slug.current)]{
    "slug": slug.current
  }
`);

const WRITING_FIELDS = `
  title,
  "slug": slug.current,
  excerpt,
  eyebrow,
  author,
  authorRole,
  authorBio,
  authorImage{
    kind,
    src,
    alt,
    poster,
    eyebrow
  },
  publishDate,
  publishLabel,
  category,
  readTime,
  "tags": tags[]->title,
  coverMedia{
    kind,
    src,
    alt,
    poster,
    eyebrow
  },
  body[]{
    title,
    paragraphs,
    quote
  },
  bodyHtml,
  seo{
    title,
    description,
    ogTitle,
    ogDescription
  }
`;

export const WRITING_POSTS_QUERY = defineQuery(`
  *[_type == "writing" && defined(slug.current)] | order(publishDate desc){
    ${WRITING_FIELDS}
  }
`);

export const WRITING_POST_QUERY = defineQuery(`
  *[_type == "writing" && slug.current == $slug][0]{
    ${WRITING_FIELDS}
  }
`);

export const WRITING_POST_SLUGS_QUERY = defineQuery(`
  *[_type == "writing" && defined(slug.current)]{
    "slug": slug.current
  }
`);
