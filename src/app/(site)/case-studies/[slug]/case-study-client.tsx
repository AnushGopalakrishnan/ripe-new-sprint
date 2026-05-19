"use client";

import Link from "next/link";
import type { Route } from "next";
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
  designWidth?: number;
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

const DESIGN_SIDE_PADDING_PX = 20;
const DESIGN_CELL_GAP_PX = 20;
const DEFAULT_LAYOUT_DESIGN_WIDTH_PX = 1440;
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

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
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
  fitMode = "cover",
}: {
  sectionId: string;
  media: CaseStudyMedia;
  mediaClassName: string;
  load?: "lazy" | "eager";
  priority?: boolean;
  fitMode?: "cover" | "contain";
}) {
  const comments = media.comments ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [frame, setFrame] = useState<{ offsetX: number; offsetY: number; width: number; height: number } | null>(
    null,
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const kind = getMediaKind(media.src, media.kind);

  const updateFrame = () => {
    if (fitMode !== "contain") {
      setFrame(null);
      return;
    }
    const wrapper = wrapperRef.current;
    const mediaElement = kind === "video" ? videoRef.current : imageRef.current;
    if (!wrapper || !mediaElement) {
      setFrame(null);
      return;
    }

    const containerWidth = wrapper.clientWidth;
    const containerHeight = wrapper.clientHeight;
    if (containerWidth <= 0 || containerHeight <= 0) {
      setFrame(null);
      return;
    }

    const intrinsicWidth =
      kind === "video" ? (mediaElement as HTMLVideoElement).videoWidth : (mediaElement as HTMLImageElement).naturalWidth;
    const intrinsicHeight =
      kind === "video"
        ? (mediaElement as HTMLVideoElement).videoHeight
        : (mediaElement as HTMLImageElement).naturalHeight;

    if (!intrinsicWidth || !intrinsicHeight) {
      setFrame(null);
      return;
    }

    const containerAspect = containerWidth / containerHeight;
    const mediaAspect = intrinsicWidth / intrinsicHeight;

    let renderedWidth = containerWidth;
    let renderedHeight = containerHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspect > mediaAspect) {
      renderedWidth = containerHeight * mediaAspect;
      offsetX = (containerWidth - renderedWidth) / 2;
    } else if (containerAspect < mediaAspect) {
      renderedHeight = containerWidth / mediaAspect;
      offsetY = (containerHeight - renderedHeight) / 2;
    }

    setFrame({
      offsetX,
      offsetY,
      width: renderedWidth,
      height: renderedHeight,
    });
  };

  useEffect(() => {
    if (!activeId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(() => {
      updateFrame();
    });
    observer.observe(wrapper);
    updateFrame();

    return () => observer.disconnect();
  }, [fitMode, kind]);

  const mediaElement =
    kind === "video" ? (
      <video
        ref={videoRef}
        className={mediaClassName}
        autoPlay
        loop
        muted
        playsInline
        preload={priority ? "auto" : "metadata"}
        poster={media.poster}
        onLoadedMetadata={updateFrame}
      >
        <source src={media.src} type={media.src.includes("m3u8") ? "application/vnd.apple.mpegurl" : undefined} />
      </video>
    ) : (
      <img
        ref={imageRef}
        className={mediaClassName}
        src={media.src}
        alt={media.alt}
        loading={load}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={updateFrame}
      />
    );

  return (
    <div
      ref={wrapperRef}
      className={styles.formaCommentable}
      data-section-id={sectionId}
      onClick={() => setActiveId(null)}
      role="presentation"
    >
      {mediaElement}
      {comments.map((comment, index) => {
        const isActive = activeId === comment.id;
        const x = frame ? frame.offsetX + (frame.width * comment.x) / 100 : `${comment.x}%`;
        const y = frame ? frame.offsetY + (frame.height * comment.y) / 100 : `${comment.y}%`;
        const style = {
          "--comment-x": typeof x === "number" ? `${x}px` : x,
          "--comment-y": typeof y === "number" ? `${y}px` : y,
        } as CSSProperties;

        return (
          <div
            key={comment.id}
            className={`${styles.formaCommentThread} ${isActive ? styles.formaCommentThreadOpen : ""}`}
            style={style}
          >
            <button
              aria-expanded={isActive}
              aria-label={`Open comment ${index + 1}`}
              className={styles.formaCommentSurface}
              onClick={(event) => {
                event.stopPropagation();
                setActiveId((prev) => (prev === comment.id ? null : comment.id));
              }}
              type="button"
            >
              <span className={styles.formaCommentAvatarWrap}>
                {comment.avatar ? (
                  <img
                    className={styles.formaCommentAvatar}
                    src={comment.avatar}
                    alt={comment.author}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className={styles.formaCommentAvatarFallback}>{initials(comment.author)}</span>
                )}
              </span>
              <span className={styles.formaCommentAuthor}>{comment.author}</span>
              <span className={styles.formaCommentBody}>{comment.body}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FormaFact({ label, children }: { label: string; children: string }) {
  return (
    <div className={styles.formaFact}>
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
    <main className={styles.formaPage}>
      <section className={styles.formaHeroStage} ref={heroStageRef} data-case-hero-stage>
        <div className={styles.formaHeroStageSticky}>
          <section className={styles.formaHero} data-case-hero>
            <CommentableMedia
              sectionId="hero"
              media={reference.media.hero}
              mediaClassName={styles.formaHeroMedia}
              load="eager"
              priority
            />
            <div className={styles.formaHeroCopy}>
              <p>{reference.eyebrow}</p>
              <h1>{reference.title}</h1>
              <span>{reference.heroNote}</span>
            </div>
          </section>
        </div>

        <section className={styles.formaInfoStage}>
          <section className={styles.formaInfo} aria-label="Project information" data-case-info>
            <div className={styles.formaFacts}>
              <FormaFact label="Brand">{reference.brand}</FormaFact>
              <FormaFact label="Services">{reference.services.join(", ")}</FormaFact>
              <FormaFact label="Industry">{reference.industry}</FormaFact>
              <FormaFact label="Year">{reference.year}</FormaFact>
            </div>
            {reference.information.length > 0 ? (
              <div className={styles.formaInformation}>
                <p className={styles.formaLabel}>(Information)</p>
                {reference.information.map((paragraph) => (
                  <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
              </div>
            ) : (
              <div />
            )}
          </section>
        </section>
        <div className={styles.formaHeroStageContent}>
          {hasFlexibleLayouts ? (
            <section className={styles.formaFlexibleLayouts} aria-label="Case study layouts">
              {reference.layouts.map((layout) => {
                const rowGap = layout.gap ?? DESIGN_CELL_GAP_PX;
                const designWidth = DEFAULT_LAYOUT_DESIGN_WIDTH_PX;
                const designInnerWidth = Math.max(designWidth - DESIGN_SIDE_PADDING_PX * 2, 1);

                return (
                  <section
                    key={layout.id}
                    className={styles.formaLayoutBlock}
                    data-layout-preset={layout.preset}
                    style={{ "--layout-gap": `${rowGap}px` } as CSSProperties}
                  >
                    {layout.rows.map((row, rowIndex) => {
                      const cellCount = Math.max(row.cells.length, 1);
                      const gapsTotal = Math.max(cellCount - 1, 0) * rowGap;
                      const rowContentWidthDesign = Math.max(designInnerWidth - gapsTotal, 1);
                      const rowHeight = row.height ?? 0;
                      const totalWidth = row.cells.reduce((sum, cell) => sum + Math.max(cell.width || 0, 0), 0) || 1;

                      return (
                        <div
                          key={`${layout.id}-row-${rowIndex}`}
                          className={styles.formaLayoutRow}
                          style={{
                            gridTemplateColumns: row.cells.map((cell) => `${Math.max(cell.width || 1, 1)}fr`).join(" "),
                            aspectRatio: rowHeight > 0 ? `${designInnerWidth} / ${rowHeight}` : undefined,
                          }}
                        >
                          {row.cells.map((cell, cellIndex) => {
                            const normalizedWidth = Math.max(cell.width || 0, 0) / totalWidth;
                            const cellTargetWidthPx = rowContentWidthDesign * normalizedWidth;
                            const cellAspectRatio = rowHeight > 0 ? cellTargetWidthPx / rowHeight : 16 / 9;

                            return (
                              <div
                                key={`${layout.id}-row-${rowIndex}-cell-${cellIndex}`}
                                className={styles.formaLayoutCell}
                                style={{ "--layout-cell-ratio": `${cellAspectRatio}` } as CSSProperties}
                              >
                                <CommentableMedia
                                  sectionId={`${layout.id}-${rowIndex}-${cellIndex}`}
                                  media={cell.media}
                                  mediaClassName={styles.formaLayoutMedia}
                                  fitMode="contain"
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </section>
                );
              })}
            </section>
          ) : (
            <>
              <section className={styles.formaIntroMedia} aria-label="Polestar imagery">
                <CommentableMedia
                  sectionId="intro"
                  media={reference.media.intro}
                  mediaClassName={styles.formaSectionMedia}
                  load="eager"
                />
              </section>

              <section className={styles.formaCarousel} aria-label="Campaign carousel">
                <div className={styles.formaCarouselPanel}>
                  <button
                    className={styles.formaArrow}
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
                    mediaClassName={styles.formaCarouselPanelMedia}
                  />
                  <button
                    className={`${styles.formaArrow} ${styles.formaArrowNext}`}
                    aria-label="Next project image"
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % slides.length)}
                    type="button"
                  >
                    &#8594;
                  </button>
                  <div className={styles.formaDots} aria-hidden="true">
                    {slides.map((slide, index) => (
                      <span
                        className={index === carouselIndex ? styles.formaDotActive : undefined}
                        key={slide.src}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.formaCarouselPoster}>
                  <CommentableMedia
                    sectionId="carousel-poster"
                    media={reference.media.carouselPoster}
                    mediaClassName={styles.formaSectionMedia}
                  />
                </div>
              </section>

              <section className={styles.formaBlackFeature} aria-label="Feature spread">
                <CommentableMedia
                  sectionId="black-feature"
                  media={reference.media.blackFeature}
                  mediaClassName={styles.formaBlackFeatureMedia}
                />
              </section>

              <section className={styles.formaWideFeature} aria-label="Wide feature">
                <CommentableMedia
                  sectionId="wide-feature"
                  media={reference.media.wideFeature}
                  mediaClassName={styles.formaSectionMedia}
                />
              </section>
            </>
          )}

          <section className={styles.formaMoreProjects} aria-label="Other case studies">
            <div className={styles.formaMoreHeader}>
              <h2>Other Case Studies</h2>
              <Link href="/case-studies">
                All case studies <span aria-hidden="true">&#8599;</span>
              </Link>
            </div>
            <div className={styles.formaProjectGrid}>
              {moreProjects.map((project) => (
                <Link
                  href={toCaseStudyHref(project.slug) as Route}
                  className={styles.formaProjectCard}
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
            <section className={styles.formaCta} aria-label="Contact">
              <CommentableMedia
                sectionId="cta"
                media={reference.media.cta}
                mediaClassName={styles.formaSectionMedia}
              />
              <div className={styles.formaCtaCopy}>
                <h2>
                  LET&rsquo;S CREATE
                  <br />
                  SOMETHING TOGETHER
                </h2>
                <a href="mailto:hello@forma.agency">
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
