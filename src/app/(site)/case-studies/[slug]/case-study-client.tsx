"use client";

import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CaseStudyCommentsToggle } from "@/components/case-study-comment-note";
import { CaseStudyCarouselButton } from "@/components/case-study-actions";
import { ContactCta } from "@/components/contact-cta";
import { CaseStudyFact, CaseStudyInformation } from "@/components/case-study-information";
import { CaseStudyRelatedProjects } from "@/components/case-study-related";
import { CaseStudyMedia as CaseStudyMediaSurface } from "@/components/case-study-media";
import type { CaseStudyMediaData, CaseStudyMediaProps } from "@/components/case-study-media";
import styles from "@/app/(site)/detail-page.module.css";

type CaseStudyMedia = CaseStudyMediaData;

type CaseStudyLayoutCell = {
  width: number;
  rowSpan?: number;
  hiddenByRowSpan?: boolean;
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

type CaseStudyReference = {
  brand: string;
  title: string;
  accentColor?: string;
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

const DESIGN_SIDE_PADDING_PX = 20;
const DESIGN_CELL_GAP_PX = 20;
const DEFAULT_LAYOUT_DESIGN_WIDTH_PX = 1440;
const CELL_WIDTH_MATCH_TOLERANCE = 0.5;
type SpanningLayoutItem = {
  cell: CaseStudyLayoutCell;
  cellAspectRatio: number;
  columnStart: number;
  columnSpan: number;
  rowIndex: number;
  rowSpan: number;
};

type SpanningLayoutDefinition =
  | {
      kind: "unsupported";
    }
  | {
      columnTemplate: string;
      items: SpanningLayoutItem[];
      kind: "supported";
      rowTemplate: string;
      totalHeight: number;
    };

function buildSpanningLayoutDefinition(layout: CaseStudyLayoutBlock, rowGap: number, designInnerWidth: number): SpanningLayoutDefinition {
  const rows = layout.rows;
  if (rows.length === 0) return { kind: "unsupported" };

  const firstRowCells = rows[0]?.cells ?? [];
  if (firstRowCells.length === 0) return { kind: "unsupported" };

  const baseWidths = firstRowCells.map((cell) => Math.max(cell.width || 0, 0));
  const hasUniformRowStructure = rows.every((row) => {
    if (row.cells.length !== baseWidths.length) return false;
    return row.cells.every((cell, index) => Math.abs(Math.max(cell.width || 0, 0) - baseWidths[index]) <= CELL_WIDTH_MATCH_TOLERANCE);
  });

  if (!hasUniformRowStructure) return { kind: "unsupported" };

  const coveredSlots = new Set<string>();
  const items: SpanningLayoutItem[] = [];
  const totalRows = rows.length;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    const row = rows[rowIndex];
    const rowHeight = Math.max(row.height ?? 0, 1);
    const cellCount = Math.max(row.cells.length, 1);
    const gapsTotal = Math.max(cellCount - 1, 0) * rowGap;
    const rowContentWidthDesign = Math.max(designInnerWidth - gapsTotal, 1);
    const totalWidth = row.cells.reduce((sum, cell) => sum + Math.max(cell.width || 0, 0), 0) || 1;

    for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex += 1) {
      const cell = row.cells[cellIndex];
      const slotId = `${rowIndex}:${cellIndex}`;
      if (coveredSlots.has(slotId) || cell.hiddenByRowSpan) continue;

      const rawSpan = typeof cell.rowSpan === "number" ? Math.floor(cell.rowSpan) : 1;
      const maxRowSpan = Math.max(totalRows - rowIndex, 1);
      const rowSpan = Math.max(1, Math.min(rawSpan || 1, maxRowSpan));
      if (rowSpan > 1) {
        for (let offset = 1; offset < rowSpan; offset += 1) {
          coveredSlots.add(`${rowIndex + offset}:${cellIndex}`);
        }
      }

      const normalizedWidth = Math.max(cell.width || 0, 0) / totalWidth;
      const cellTargetWidthPx = rowContentWidthDesign * normalizedWidth;
      const spannedHeight = rowHeight * rowSpan + rowGap * (rowSpan - 1);
      const cellAspectRatio = spannedHeight > 0 ? cellTargetWidthPx / spannedHeight : 16 / 9;

      items.push({
        cell,
        columnStart: cellIndex + 1,
        columnSpan: 1,
        rowIndex,
        rowSpan,
        cellAspectRatio,
      });
    }
  }

  const columnTemplate = baseWidths.map((width) => `${Math.max(width, 1)}fr`).join(" ");
  const rowTemplate = rows.map((row) => `${Math.max(row.height ?? 0, 1)}fr`).join(" ");
  const totalHeight = rows.reduce((sum, row) => sum + Math.max(row.height ?? 0, 1), 0) + rowGap * Math.max(rows.length - 1, 0);

  return {
    kind: "supported",
    columnTemplate,
    rowTemplate,
    totalHeight: Math.max(totalHeight, 1),
    items,
  };
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

function CommentableMedia(props: Omit<CaseStudyMediaProps, "styles">) {
  return <CaseStudyMediaSurface {...props} styles={styles} />;
}

export function CaseStudyClient({ reference, moreProjects }: CaseStudyClientProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [commentsVisible, setCommentsVisible] = useState(true);
  const pageStyle = {
    "--case-study-player-accent": reference.accentColor?.trim() || "#ffffff",
  } as CSSProperties;
  const hideHeroOverlayText = true;
  const slides = reference.media.carouselSlides;
  const hasFlexibleLayouts = reference.layouts.length > 0;
  const heroStageRef = useRef<HTMLElement | null>(null);
  const hasAnyComments =
    (reference.media.hero.comments?.length ?? 0) > 0 ||
    (reference.media.intro.comments?.length ?? 0) > 0 ||
    reference.media.carouselSlides.some((media) => (media.comments?.length ?? 0) > 0) ||
    (reference.media.carouselPoster.comments?.length ?? 0) > 0 ||
    (reference.media.blackFeature.comments?.length ?? 0) > 0 ||
    (reference.media.wideFeature.comments?.length ?? 0) > 0 ||
    (reference.media.cta.comments?.length ?? 0) > 0 ||
    reference.layouts.some((layout) => layout.rows.some((row) => row.cells.some((cell) => (cell.media.comments?.length ?? 0) > 0)));

  const toggleCommentsVisibility = useCallback(() => {
    setCommentsVisible((current) => !current);
  }, []);

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

  useEffect(() => {
    if (!hasAnyComments) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() !== "c") return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable) return;
      }

      event.preventDefault();
      setCommentsVisible((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasAnyComments]);

  return (
    <main className={styles.formaPage} style={pageStyle}>
      <section className={styles.formaHeroStage} ref={heroStageRef} data-case-hero-stage>
        <div className={styles.formaHeroStageSticky} data-nav-tone="light">
          <section className={styles.formaHero} data-case-hero>
            <CommentableMedia
              sectionId="hero"
              media={reference.media.hero}
              mediaClassName={styles.formaHeroMedia}
              load="eager"
              priority
              imageSizes="100vw"
              commentsVisible={commentsVisible}
            />
            <div className={`${styles.formaHeroCopy} ${hideHeroOverlayText ? styles.formaHeroCopyHidden : ""}`}>
              <p>{reference.eyebrow}</p>
              <h1>{reference.title}</h1>
              <span>{reference.heroNote}</span>
            </div>
          </section>
        </div>

        <section className={styles.formaInfoStage} data-nav-tone="dark">
          <section className={styles.formaInfo} aria-label="Project information" data-case-info>
            <div className={styles.formaFacts}>
              <CaseStudyFact label="Brand" styles={styles}>{reference.brand}</CaseStudyFact>
              <CaseStudyFact label="Services" styles={styles}>{reference.services.join(", ")}</CaseStudyFact>
              <CaseStudyFact label="Industry" styles={styles}>{reference.industry}</CaseStudyFact>
              <CaseStudyFact label="Year" styles={styles}>{reference.year}</CaseStudyFact>
            </div>
            {reference.information.length > 0 ? (
              <CaseStudyInformation paragraphs={reference.information} styles={styles} />
            ) : (
              <div />
            )}
          </section>
        </section>
        <div className={styles.formaHeroStageContent} data-nav-tone="dark">
          {hasFlexibleLayouts ? (
            <section className={styles.formaFlexibleLayouts} aria-label="Case study layouts">
              {reference.layouts.map((layout) => {
                const rowGap = layout.gap ?? DESIGN_CELL_GAP_PX;
                const designWidth = layout.designWidth ?? DEFAULT_LAYOUT_DESIGN_WIDTH_PX;
                const designInnerWidth = Math.max(designWidth - DESIGN_SIDE_PADDING_PX * 2, 1);
                const hasRowSpan = layout.rows.some((row) => row.cells.some((cell) => (cell.rowSpan ?? 1) > 1));
                const spanningLayout = hasRowSpan ? buildSpanningLayoutDefinition(layout, rowGap, designInnerWidth) : null;
                const canRenderSpanningLayout = spanningLayout?.kind === "supported";

                return (
                  <section
                    key={layout.id}
                    className={styles.formaLayoutBlock}
                    data-layout-preset={layout.preset}
                    data-layout-has-span={canRenderSpanningLayout ? "true" : "false"}
                    style={
                      canRenderSpanningLayout
                        ? ({
                            "--layout-gap": `${rowGap}px`,
                            gridTemplateColumns: spanningLayout.columnTemplate,
                            gridTemplateRows: spanningLayout.rowTemplate,
                            aspectRatio: `${designInnerWidth} / ${spanningLayout.totalHeight}`,
                          } as CSSProperties)
                        : ({ "--layout-gap": `${rowGap}px` } as CSSProperties)
                    }
                  >
                    {canRenderSpanningLayout
                      ? spanningLayout.items.map((item, itemIndex) => (
                          <div
                            key={`${layout.id}-span-cell-${item.rowIndex}-${item.columnStart}-${itemIndex}`}
                            className={styles.formaLayoutCell}
                            style={
                              {
                                "--layout-cell-ratio": `${item.cellAspectRatio}`,
                                gridColumn: `${item.columnStart} / span ${item.columnSpan}`,
                                gridRow: `${item.rowIndex + 1} / span ${item.rowSpan}`,
                              } as CSSProperties
                            }
                          >
                            <CommentableMedia
                              sectionId={`${layout.id}-${item.rowIndex}-${item.columnStart - 1}`}
                              media={item.cell.media}
                              mediaClassName={styles.formaLayoutMedia}
                              fitMode="cover"
                              imageSizes="(max-width: 900px) 100vw, 95vw"
                              commentsVisible={commentsVisible}
                            />
                          </div>
                        ))
                      : layout.rows.map((row, rowIndex) => {
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
                                      imageSizes="(max-width: 900px) 100vw, 95vw"
                                      commentsVisible={commentsVisible}
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
                  imageSizes="(max-width: 900px) 100vw, 95vw"
                  commentsVisible={commentsVisible}
                />
              </section>

              <section className={styles.formaCarousel} aria-label="Campaign carousel">
                <div className={styles.formaCarouselPanel}>
                  <CaseStudyCarouselButton direction="previous" onClick={() => setCarouselIndex((prev) => (prev - 1 + slides.length) % slides.length)} styles={styles} />
                  <CommentableMedia
                    key={slides[carouselIndex]?.src ?? "carousel-slide"}
                    sectionId="carousel-left"
                    media={slides[carouselIndex]}
                    mediaClassName={styles.formaCarouselPanelMedia}
                    imageSizes="(max-width: 900px) 80vw, 524px"
                    commentsVisible={commentsVisible}
                  />
                  <CaseStudyCarouselButton direction="next" onClick={() => setCarouselIndex((prev) => (prev + 1) % slides.length)} styles={styles} />
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
                    imageSizes="(max-width: 900px) 100vw, 50vw"
                    commentsVisible={commentsVisible}
                  />
                </div>
              </section>

              <section className={styles.formaBlackFeature} aria-label="Feature spread">
                <CommentableMedia
                  sectionId="black-feature"
                  media={reference.media.blackFeature}
                  mediaClassName={styles.formaBlackFeatureMedia}
                  imageSizes="(max-width: 900px) 100vw, 1116px"
                  commentsVisible={commentsVisible}
                />
              </section>

              <section className={styles.formaWideFeature} aria-label="Wide feature">
                <CommentableMedia
                  sectionId="wide-feature"
                  media={reference.media.wideFeature}
                  mediaClassName={styles.formaSectionMedia}
                  imageSizes="(max-width: 900px) 100vw, 95vw"
                  commentsVisible={commentsVisible}
                />
              </section>
            </>
          )}

          <CaseStudyRelatedProjects
            projects={moreProjects.map((project) => ({
              ...project,
              href: toCaseStudyHref(project.slug) as Route,
            }))}
            styles={styles}
          />

          {!hasFlexibleLayouts ? (
            <section className={styles.formaCta} aria-label="Contact">
              <CommentableMedia
                sectionId="cta"
                media={reference.media.cta}
                mediaClassName={styles.formaSectionMedia}
                imageSizes="100vw"
                commentsVisible={commentsVisible}
              />
              <div className={styles.formaCtaCopy}>
                <h2>
                  LET&rsquo;S CREATE
                  <br />
                  SOMETHING TOGETHER
                </h2>
                <ContactCta />
              </div>
            </section>
          ) : null}
        </div>
      </section>
      {hasAnyComments ? (
        <CaseStudyCommentsToggle commentsVisible={commentsVisible} onToggle={toggleCommentsVisibility} styles={styles} />
      ) : null}
    </main>
  );
}
