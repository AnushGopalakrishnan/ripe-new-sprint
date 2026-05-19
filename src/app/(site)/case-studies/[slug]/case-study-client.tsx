"use client";

import Link from "next/link";
import type { Route } from "next";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "@/app/(site)/detail-page.module.css";

type MediaKind = "auto" | "image" | "video";

type CaseStudyMedia = {
  src: string;
  alt: string;
  kind?: MediaKind;
  poster?: string;
  comments?: CaseStudyComment[];
};

type CaseStudyLayoutCell = {
  width: number;
  media: CaseStudyMedia;
};

type CaseStudyLayoutRow = {
  height?: number;
  cells: CaseStudyLayoutCell[];
};

type CaseStudyLayoutBlock = {
  id: string;
  preset: "layout1" | "layout2" | "layout3" | "layout4" | "layout5" | "layout6";
  gap?: number;
  rows: CaseStudyLayoutRow[];
};

type CaseStudyComment = {
  id: string;
  author: string;
  avatar?: string;
  body: string;
  x: number;
  y: number;
  createdAt: string;
};

type CaseStudyReference = {
  brand: string;
  title: string;
  heroNote: string;
  eyebrow: string;
  services: string[];
  industry: string;
  year: string;
  information: string[];
  media: {
    hero: CaseStudyMedia;
    intro: CaseStudyMedia;
    carouselSlides: CaseStudyMedia[];
    carouselPoster: CaseStudyMedia;
    blackFeature: CaseStudyMedia;
    wideFeature: CaseStudyMedia;
    cta: CaseStudyMedia;
  };
  layouts: CaseStudyLayoutBlock[];
};

type MoreProject = {
  title: string;
  year: string;
  image: string;
  slug?: string;
};

type CaseStudyClientProps = {
  reference: CaseStudyReference;
  moreProjects: MoreProject[];
};

const videoExtensions = new Set(["mp4", "webm", "mov", "m4v", "ogv", "ogg", "m3u8"]);

function parsePathname(src: string) {
  try {
    return new URL(src).pathname;
  } catch {
    return src;
  }
}

function getMediaKind(src: string, kind: MediaKind = "auto") {
  if (kind !== "auto") return kind;
  if (src.startsWith("data:video/")) return "video";

  const pathname = parsePathname(src).toLowerCase();
  const extension = pathname.split(".").pop() ?? "";
  return videoExtensions.has(extension) ? "video" : "image";
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
}

function toCaseStudyHref(slugOrPath?: string): `/case-studies${string}` {
  if (!slugOrPath) return "/case-studies";
  const raw = slugOrPath.trim();
  if (!raw) return "/case-studies";

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      const path = parsed.pathname.startsWith("/") ? parsed.pathname : `/${parsed.pathname}`;
      if (path.startsWith("/case-studies/")) return path as `/case-studies${string}`;
      return `/case-studies${path}` as `/case-studies${string}`;
    } catch {
      return "/case-studies";
    }
  }
  if (raw.startsWith("/case-studies/")) return raw as `/case-studies${string}`;
  if (raw.startsWith("/")) return `/case-studies${raw}`;
  return `/case-studies/${raw}`;
}

function CommentableMedia({
  sectionId,
  media,
  mediaClassName,
  load = "lazy",
  priority = false,
}: {
  sectionId: string;
  media: CaseStudyMedia;
  mediaClassName: string;
  load?: "lazy" | "eager";
  priority?: boolean;
}) {
  const comments = media.comments ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const kind = getMediaKind(media.src, media.kind);

  useEffect(() => {
    if (!activeId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId]);

  const mediaElement =
    kind === "video" ? (
      <video
        className={mediaClassName}
        autoPlay
        loop
        muted
        playsInline
        preload={priority ? "auto" : "metadata"}
        poster={media.poster}
      >
        <source src={media.src} type={media.src.includes("m3u8") ? "application/vnd.apple.mpegurl" : undefined} />
      </video>
    ) : (
      <img
        className={mediaClassName}
        src={media.src}
        alt={media.alt}
        loading={load}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    );

  return (
    <div
      className={styles.detailCommentable}
      data-section-id={sectionId}
      onClick={() => setActiveId(null)}
      role="presentation"
    >
      {mediaElement}
      {comments.map((comment, index) => {
        const isActive = activeId === comment.id;
        const style = {
          "--comment-x": `${comment.x}%`,
          "--comment-y": `${comment.y}%`,
        } as CSSProperties;

        return (
          <div
            key={comment.id}
            className={`${styles.detailCommentThread} ${isActive ? styles.detailCommentThreadOpen : ""}`}
            style={style}
          >
            <button
              aria-expanded={isActive}
              aria-label={`${isActive ? "Close" : "Open"} comment ${index + 1}`}
              className={styles.detailCommentSurface}
              onClick={(event) => {
                event.stopPropagation();
                setActiveId((prev) => (prev === comment.id ? null : comment.id));
              }}
              type="button"
            >
              <span className={styles.detailCommentAvatarWrap}>
                {comment.avatar ? (
                  <img
                    className={styles.detailCommentAvatar}
                    src={comment.avatar}
                    alt={comment.author}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className={styles.detailCommentAvatarFallback}>{initials(comment.author)}</span>
                )}
              </span>
              <span className={styles.detailCommentIcon} aria-hidden="true">
                <MessageCircle size={13} strokeWidth={2.15} />
              </span>
              <span className={styles.detailCommentContent}>
                <span className={styles.detailCommentAuthor}>{comment.author}</span>
                <span className={styles.detailCommentBody}>{comment.body}</span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function DetailFact({ label, children }: { label: string; children: string }) {
  return (
    <div className={styles.detailFact}>
      <p>({label})</p>
      <strong>{children}</strong>
    </div>
  );
}

export function CaseStudyClient({ reference, moreProjects }: CaseStudyClientProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const slides = reference.media.carouselSlides;
  const hasFlexibleLayouts = reference.layouts.length > 0;
  const heroStageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stage = heroStageRef.current;
    if (!stage) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId: number | null = null;

    const applyProgress = () => {
      frameId = null;
      const current = heroStageRef.current;
      if (!current) return;

      if (reducedMotionQuery.matches) {
        current.style.setProperty("--hero-progress", "0");
        return;
      }

      const rect = current.getBoundingClientRect();
      const totalScrollableDistance = Math.max(window.innerHeight, 1);
      const rawProgress = -rect.top / totalScrollableDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));
      current.style.setProperty("--hero-progress", progress.toFixed(4));
    };

    const queueProgressUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(applyProgress);
    };

    queueProgressUpdate();
    window.addEventListener("scroll", queueProgressUpdate, { passive: true });
    window.addEventListener("resize", queueProgressUpdate);

    const handleMediaChange = () => queueProgressUpdate();
    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", handleMediaChange);
    } else {
      reducedMotionQuery.addListener(handleMediaChange);
    }

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", queueProgressUpdate);
      window.removeEventListener("resize", queueProgressUpdate);
      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", handleMediaChange);
      } else {
        reducedMotionQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  return (
    <main className={styles.detailPage}>
      <section className={styles.detailHeroStage} ref={heroStageRef} data-case-hero-stage>
        <div className={styles.detailHeroStageSticky}>
          <section className={styles.detailHero} data-case-hero>
            <CommentableMedia
              sectionId="hero"
              media={reference.media.hero}
              mediaClassName={styles.detailHeroMedia}
              load="eager"
              priority
            />
            <div className={styles.detailHeroCopy}>
              <p>{reference.brand}</p>
              <h1>{reference.title}</h1>
              <span>{reference.heroNote}</span>
            </div>
          </section>
        </div>

        <section className={styles.detailInfoStage}>
          <section className={styles.detailInfo} aria-label="Project information" data-case-info>
            <div className={styles.detailFacts}>
              <DetailFact label="Brand">{reference.brand}</DetailFact>
              <DetailFact label="Services">{reference.services.join(", ")}</DetailFact>
              <DetailFact label="Industry">{reference.industry}</DetailFact>
              <DetailFact label="Year">{reference.year}</DetailFact>
            </div>
            {reference.information.length > 0 ? (
              <div className={styles.detailInformation}>
                <p className={styles.detailLabel}>(Information)</p>
                {reference.information.map((paragraph) => (
                  <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
              </div>
            ) : (
              <div />
            )}
          </section>
        </section>
        <div className={styles.detailHeroStageContent}>
          {hasFlexibleLayouts ? (
        <section className={styles.detailFlexibleLayouts} aria-label="Case study layouts">
          {reference.layouts.map((layout) => (
            <section
              key={layout.id}
              className={styles.detailLayoutBlock}
              data-layout-preset={layout.preset}
              style={{ "--layout-gap": `${layout.gap ?? 20}px` } as CSSProperties}
            >
              {layout.rows.map((row, rowIndex) => (
                <div
                  key={`${layout.id}-row-${rowIndex}`}
                  className={styles.detailLayoutRow}
                  style={{
                    gridTemplateColumns: row.cells
                      .map((cell) => `${Math.max(cell.width || 1, 1)}fr`)
                      .join(" "),
                    height: row.height ? `${row.height}px` : undefined,
                  }}
                >
                  {row.cells.map((cell, cellIndex) => (
                    <div key={`${layout.id}-row-${rowIndex}-cell-${cellIndex}`} className={styles.detailLayoutCell}>
                      <CommentableMedia
                        sectionId={`${layout.id}-${rowIndex}-${cellIndex}`}
                        media={cell.media}
                        mediaClassName={styles.detailLayoutMedia}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </section>
          ) : (
            <>
              <section className={styles.detailIntroMedia} aria-label="Intro imagery">
                <CommentableMedia
                  sectionId="intro"
                  media={reference.media.intro}
                  mediaClassName={styles.detailSectionMedia}
                  load="eager"
                />
              </section>

              <section className={styles.detailCarousel} aria-label="Campaign carousel">
                <div className={styles.detailCarouselPanel}>
                  <button
                    className={styles.detailArrow}
                    aria-label="Previous project image"
                    onClick={() => setCarouselIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                    type="button"
                  >
                    &#8592;
                  </button>
                  <CommentableMedia
                    key={slides[carouselIndex]?.src ?? "carousel-slide"}
                    sectionId="carousel-left"
                    media={slides[carouselIndex]}
                    mediaClassName={styles.detailCarouselPanelMedia}
                  />
                  <button
                    className={`${styles.detailArrow} ${styles.detailArrowNext}`}
                    aria-label="Next project image"
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % slides.length)}
                    type="button"
                  >
                    &#8594;
                  </button>
                  <div className={styles.detailDots} aria-hidden="true">
                    {slides.map((slide, index) => (
                      <span
                        className={index === carouselIndex ? styles.detailDotActive : undefined}
                        key={slide.src}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.detailCarouselPoster}>
                  <CommentableMedia
                    sectionId="carousel-poster"
                    media={reference.media.carouselPoster}
                    mediaClassName={styles.detailSectionMedia}
                  />
                </div>
              </section>

              <section className={styles.detailBlackFeature} aria-label="Feature spread">
                <CommentableMedia
                  sectionId="black-feature"
                  media={reference.media.blackFeature}
                  mediaClassName={styles.detailBlackFeatureMedia}
                />
              </section>

              <section className={styles.detailWideFeature} aria-label="Wide feature">
                <CommentableMedia
                  sectionId="wide-feature"
                  media={reference.media.wideFeature}
                  mediaClassName={styles.detailSectionMedia}
                />
              </section>
            </>
          )}

          <section className={styles.detailMoreProjects} aria-label="Other case studies">
            <div className={styles.detailMoreHeader}>
              <h2>Other Case Studies</h2>
              <Link href="/case-studies">
                All case studies <span aria-hidden="true">&#8599;</span>
              </Link>
            </div>
            <div className={styles.detailProjectGrid}>
              {moreProjects.map((project) => (
                <Link
                  href={toCaseStudyHref(project.slug) as Route}
                  className={styles.detailProjectCard}
                  key={`${project.title}-${project.year}`}
                >
                  <img src={project.image} alt="" loading="lazy" decoding="async" />
                  <span>{project.title}</span>
                  <span>{project.year}</span>
                </Link>
              ))}
            </div>
          </section>

          {!hasFlexibleLayouts ? (
            <section className={styles.detailCta} aria-label="Contact">
              <CommentableMedia
                sectionId="cta"
                media={reference.media.cta}
                mediaClassName={styles.detailSectionMedia}
              />
              <div className={styles.detailCtaCopy}>
                <h2>
                  LET&rsquo;S CREATE
                  <br />
                  SOMETHING TOGETHER
                </h2>
                <a href="mailto:hello@ripe.studio">
                  Get in touch <span aria-hidden="true">&#8599;</span>
                </a>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
