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
    "src": coalesce(src, image.asset->url, video.asset->url),
    alt,
    "poster": coalesce(poster, posterImage.asset->url),
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

const CASE_STUDY_MEDIA_FIELDS = `
    "kind": coalesce(
      kind,
      select(defined(upload.asset->mimeType) && upload.asset->mimeType match "video/*" => "video"),
      select(defined(video.asset->url) => "video"),
      "image"
    ),
    "src": coalesce(src, upload.asset->url, image.asset->url, video.asset->url),
    alt,
    "poster": coalesce(poster, posterImage.asset->url),
    eyebrow
`;

const CASE_STUDY_COMMENT_FIELDS = `
      _key,
      author,
      commenter->{
        name,
        role,
        "avatar": coalesce(
          avatar.upload.asset->url,
          avatar.image.asset->url,
          avatar.asset->url,
          avatar.src,
          avatar.video.asset->url
        )
      },
      body,
      position{
        x,
        y
      }
`;

const CASE_STUDY_FIELDS = `
  title,
  "slug": slug.current,
  client,
  summary,
  detailEyebrow,
  detailServices,
  "detailServiceTitles": detailServices[]->title,
  "detailServiceRefs": detailServices[]._ref,
  "detailServiceItems": detailServices[]{_type, _ref, title},
  detailIndustry,
  detailInformation,
  detailLayouts[]{
    _key,
    preset,
    gap,
    rows[]{
      _key,
      height,
      cells[]{
        _key,
        width,
        content{
          media{
${CASE_STUDY_MEDIA_FIELDS}
          },
          comments[]{
${CASE_STUDY_COMMENT_FIELDS}
          }
        }
      }
    }
  },
  detailLayoutEntries[]{
    _key,
    layout->{
      _id,
      title,
      preset,
      designWidth,
      gap,
      rows[]{
        _key,
        height,
        cells[]{
          _key,
          width
        }
      }
    },
    content[]{
      _key,
      media{
${CASE_STUDY_MEDIA_FIELDS}
      },
      comments[]{
${CASE_STUDY_COMMENT_FIELDS}
      }
    }
  },
  detailHero{
    media{
${CASE_STUDY_MEDIA_FIELDS}
    },
    comments[]{
${CASE_STUDY_COMMENT_FIELDS}
    }
  },
  detailIntro{
    media{
${CASE_STUDY_MEDIA_FIELDS}
    },
    comments[]{
${CASE_STUDY_COMMENT_FIELDS}
    }
  },
  detailCarouselSlides[]{
    _key,
    media{
${CASE_STUDY_MEDIA_FIELDS}
    },
    comments[]{
${CASE_STUDY_COMMENT_FIELDS}
    }
  },
  detailCarouselPoster{
    media{
${CASE_STUDY_MEDIA_FIELDS}
    },
    comments[]{
${CASE_STUDY_COMMENT_FIELDS}
    }
  },
  detailBlackFeature{
    media{
${CASE_STUDY_MEDIA_FIELDS}
    },
    comments[]{
${CASE_STUDY_COMMENT_FIELDS}
    }
  },
  detailWideFeature{
    media{
${CASE_STUDY_MEDIA_FIELDS}
    },
    comments[]{
${CASE_STUDY_COMMENT_FIELDS}
    }
  },
  detailCta{
    media{
${CASE_STUDY_MEDIA_FIELDS}
    },
    comments[]{
${CASE_STUDY_COMMENT_FIELDS}
    }
  },
  detailMoreProjects[]{
    _key,
    title,
    year,
    slug,
    media{
${CASE_STUDY_MEDIA_FIELDS}
    }
  },
  year,
  order,
  accentColor,
  accentColorText,
  "tags": tags[]->title,
  featured,
  theme,
  coverMedia{
${CASE_STUDY_MEDIA_FIELDS}
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
${CASE_STUDY_MEDIA_FIELDS}
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
    "src": coalesce(src, image.asset->url, video.asset->url),
    alt,
    "poster": coalesce(poster, posterImage.asset->url),
    eyebrow
  },
  publishDate,
  publishLabel,
  category,
  readTime,
  "tags": tags[]->title,
  coverMedia{
    kind,
    "src": coalesce(src, image.asset->url, video.asset->url),
    alt,
    "poster": coalesce(poster, posterImage.asset->url),
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

const TEAM_MEMBER_FIELDS = `
  name,
  "slug": slug.current,
  role,
  "group": coalesce(group, "Team"),
  avatar{
    kind,
    "src": coalesce(src, upload.asset->url, image.asset->url, video.asset->url),
    alt,
    "poster": coalesce(poster, posterImage.asset->url),
    eyebrow
  },
  bio,
  bioSummary,
  email,
  phone,
  websiteUrl,
  twitterUrl,
  "projects": projects[]->{
    title,
    "slug": slug.current
  }
`;

export const TEAM_MEMBERS_QUERY = defineQuery(`
  *[_type == "teamMember" && defined(slug.current)] | order(group asc, publishedAt asc, name asc){
    ${TEAM_MEMBER_FIELDS}
  }
`);

export const TEAM_MEMBER_QUERY = defineQuery(`
  *[_type == "teamMember" && slug.current == $slug][0]{
    ${TEAM_MEMBER_FIELDS}
  }
`);

export const TEAM_MEMBER_SLUGS_QUERY = defineQuery(`
  *[_type == "teamMember" && defined(slug.current)]{
    "slug": slug.current
  }
`);
