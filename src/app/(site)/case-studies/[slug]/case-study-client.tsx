"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
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
  serviceDebug?: {
    detailServices?: unknown;
    detailServiceTitles?: unknown;
    detailServiceRefs?: unknown;
    detailServiceItems?: unknown;
  };
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

type DragPosition = {
  x: number;
  y: number;
};

type DragState = {
  didDrag: boolean;
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
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
  const [dragPositions, setDragPositions] = useState<Record<string, DragPosition>>({});
  const [frame, setFrame] = useState<{ offsetX: number; offsetY: number; width: number; height: number } | null>(
    null,
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastPointerTypeRef = useRef<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressNextClickRef = useRef(false);
  const suppressNextTouchRef = useRef(false);
  const kind = getMediaKind(media.src, media.kind);

  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openComment = (id: string) => {
    clearCloseTimer();
    setActiveId(id);
  };

  const closeComment = (id: string) => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveId((prev) => (prev === id ? null : prev));
      closeTimerRef.current = null;
    }, 90);
  };

  const moveCommentToPointer = (id: string, clientX: number, clientY: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;

    const originX = rect.left + (frame?.offsetX ?? 0);
    const originY = rect.top + (frame?.offsetY ?? 0);
    const width = frame?.width ?? rect.width;
    const height = frame?.height ?? rect.height;

    if (width <= 0 || height <= 0) return;

    setDragPositions((prev) => ({
      ...prev,
      [id]: {
        x: clampPercent(((clientX - originX) / width) * 100),
        y: clampPercent(((clientY - originY) / height) * 100),
      },
    }));
  };

  const updateFrame = useCallback(() => {
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
  }, [fitMode, kind]);

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
  }, [updateFrame]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

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
      className={styles.detailCommentable}
      data-section-id={sectionId}
      onClick={() => setActiveId(null)}
      role="presentation"
    >
      {mediaElement}
      {comments.map((comment, index) => {
        const position = dragPositions[comment.id] ?? comment;
        const isActive = activeId === comment.id;
        const x = frame ? frame.offsetX + (frame.width * position.x) / 100 : `${position.x}%`;
        const y = frame ? frame.offsetY + (frame.height * position.y) / 100 : `${position.y}%`;
        const threadClasses = [
          styles.detailCommentThread,
          isActive ? styles.detailCommentThreadOpen : "",
          position.x > 50 ? styles.detailCommentThreadExpandLeft : "",
          position.y <= 50 ? styles.detailCommentThreadExpandDown : "",
        ]
          .filter(Boolean)
          .join(" ");
        const style = {
          "--comment-x": typeof x === "number" ? `${x}px` : x,
          "--comment-y": typeof y === "number" ? `${y}px` : y,
        } as CSSProperties;

        return (
          <div key={comment.id} className={threadClasses} style={style}>
            <button
              aria-expanded={isActive}
              aria-label={`Open and drag note ${index + 1}`}
              className={styles.detailCommentSurface}
              onBlur={() => {
                setActiveId((prev) => (prev === comment.id ? null : prev));
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (suppressNextClickRef.current) {
                  suppressNextClickRef.current = false;
                  return;
                }
                if (lastPointerTypeRef.current === "touch") {
                  setActiveId((prev) => (prev === comment.id ? null : comment.id));
                  return;
                }
                setActiveId(comment.id);
              }}
              onFocus={() => openComment(comment.id)}
              onPointerDown={(event) => {
                lastPointerTypeRef.current = event.pointerType;
                if (!event.isPrimary || event.button !== 0) return;
                clearCloseTimer();
                dragStateRef.current = {
                  didDrag: false,
                  id: comment.id,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") openComment(comment.id);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "touch") closeComment(comment.id);
              }}
              onPointerMove={(event) => {
                const dragState = dragStateRef.current;
                if (!dragState || dragState.id !== comment.id) return;

                const distance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
                if (!dragState.didDrag && distance < 3) return;

                dragState.didDrag = true;
                suppressNextClickRef.current = true;
                suppressNextTouchRef.current = true;
                clearCloseTimer();
                setActiveId(comment.id);
                moveCommentToPointer(comment.id, event.clientX, event.clientY);
              }}
              onPointerUp={(event) => {
                const dragState = dragStateRef.current;
                if (!dragState || dragState.id !== comment.id) return;

                if (dragState.didDrag) {
                  event.preventDefault();
                  event.stopPropagation();
                  moveCommentToPointer(comment.id, event.clientX, event.clientY);
                }

                if (event.currentTarget.hasPointerCapture(dragState.pointerId)) {
                  event.currentTarget.releasePointerCapture(dragState.pointerId);
                }
                dragStateRef.current = null;
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (suppressNextTouchRef.current) {
                  suppressNextTouchRef.current = false;
                  return;
                }
                lastPointerTypeRef.current = "touch";
                setActiveId((prev) => (prev === comment.id ? null : comment.id));
              }}
              type="button"
            >
              <span
                className={`${styles.detailCommentAvatarWrap} ${
                  comment.avatar ? styles.detailCommentAvatarWrapWithImage : ""
                }`}
              >
                {comment.avatar ? (
                  <img
                    className={styles.detailCommentAvatar}
                    src={comment.avatar}
                    alt={comment.author}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className={styles.detailCommentAvatarFallback} aria-hidden="true" />
                )}
              </span>
              <span className={styles.detailCommentCard}>
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
    console.log("[CaseStudy Services Debug]", {
      title: reference.title,
      services: reference.services,
      servicesJoined: reference.services.join(", "),
      serviceDebug: reference.serviceDebug,
      industry: reference.industry,
      year: reference.year,
    });
  }, [reference.industry, reference.serviceDebug, reference.services, reference.title, reference.year]);

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
                                  fitMode="cover"
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
