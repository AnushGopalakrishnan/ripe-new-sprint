"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CaseStudyLongFormPlayer } from "@/components/case-study-long-form-player";
import styles from "@/app/(site)/detail-page.module.css";

type MediaKind = "auto" | "image" | "video";

type CaseStudyMedia = {
  src: string;
  alt: string;
  kind?: MediaKind;
  poster?: string;
  longForm?: {
    enabled: boolean;
    hlsUrl?: string;
  };
  comments?: CaseStudyComment[];
};

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
const CELL_WIDTH_MATCH_TOLERANCE = 0.5;
const INFORMATION_COLLAPSED_LINES = 10;
const videoExtensions = new Set(["mp4", "webm", "mov", "m4v", "ogv", "ogg", "m3u8"]);

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

function CommentableMedia({
  sectionId,
  media,
  mediaClassName,
  load = "lazy",
  priority = false,
  fitMode = "cover",
  imageSizes = "100vw",
  commentsVisible = true,
}: {
  sectionId: string;
  media: CaseStudyMedia;
  mediaClassName: string;
  load?: "lazy" | "eager";
  priority?: boolean;
  fitMode?: "cover" | "contain";
  imageSizes?: string;
  commentsVisible?: boolean;
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
  const longFormVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastPointerTypeRef = useRef<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressNextClickRef = useRef(false);
  const suppressNextTouchRef = useRef(false);
  const kind = getMediaKind(media.src, media.kind);
  const longFormHlsUrl = media.longForm?.hlsUrl?.trim();
  const isLongFormVideo = kind === "video" && media.longForm?.enabled === true && Boolean(longFormHlsUrl);

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
    const mediaElement =
      kind === "video" ? (isLongFormVideo ? longFormVideoRef.current : videoRef.current) : imageRef.current;
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
      kind === "video"
        ? (mediaElement as HTMLVideoElement).videoWidth
        : (mediaElement as HTMLImageElement).naturalWidth;
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
  }, [fitMode, isLongFormVideo, kind]);

  useEffect(() => {
    if (commentsVisible) return;
    const resetTimer = window.setTimeout(() => setActiveId(null), 0);
    return () => window.clearTimeout(resetTimer);
  }, [commentsVisible]);

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
    kind === "video" && isLongFormVideo && longFormHlsUrl ? (
      <CaseStudyLongFormPlayer
        styles={styles}
        mediaClassName={mediaClassName}
        src={longFormHlsUrl}
        poster={media.poster}
        preload={priority ? "auto" : "metadata"}
        videoRef={longFormVideoRef}
        onLoadedMetadata={updateFrame}
      />
    ) : kind === "video" ? (
      <video
        ref={videoRef}
        className={mediaClassName}
        autoPlay
        loop
        muted
        playsInline
        preload={priority ? "auto" : "metadata"}
        poster={media.poster}
        crossOrigin="anonymous"
        onLoadedMetadata={updateFrame}
      >
        <source src={media.src} type={media.src.includes("m3u8") ? "application/vnd.apple.mpegurl" : undefined} />
      </video>
    ) : (
      <Image
        className={mediaClassName}
        src={media.src}
        alt={media.alt}
        fill
        sizes={imageSizes}
        crossOrigin="anonymous"
        priority={priority}
        loading={priority ? undefined : load}
        onLoad={(event) => {
          imageRef.current = event.currentTarget;
          updateFrame();
        }}
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
      {commentsVisible
        ? comments.map((comment, index) => {
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
      })
        : null}
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

function getInitialInformationText(paragraphs: string[]) {
  return paragraphs
    .map((paragraph) => paragraph.replace(/<[^>]*>/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDecodedInformationText(paragraphs: string[]) {
  const container = document.createElement("div");

  return paragraphs
    .map((paragraph) => {
      container.innerHTML = paragraph;
      return container.textContent ?? "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCollapsedInformationText(
  text: string,
  content: HTMLDivElement,
  computed: CSSStyleDeclaration,
  collapsedHeight: number,
) {
  const width = content.clientWidth;
  if (width <= 0 || text.length === 0) return text;

  const probe = document.createElement("p");
  probe.style.fontFamily = computed.fontFamily;
  probe.style.fontSize = computed.fontSize;
  probe.style.fontStyle = computed.fontStyle;
  probe.style.fontWeight = computed.fontWeight;
  probe.style.letterSpacing = computed.letterSpacing;
  probe.style.lineHeight = computed.lineHeight;
  probe.style.margin = "0";
  probe.style.pointerEvents = "none";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "normal";
  probe.style.width = `${width}px`;
  document.body.appendChild(probe);

  let low = 0;
  let high = text.length;
  let best = "";

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid).trimEnd();
    probe.textContent = `${candidate}..`;

    if (probe.scrollHeight <= collapsedHeight + 1) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  document.body.removeChild(probe);

  const wordSafe = best.replace(/\s+\S*$/, "").trimEnd();
  return `${wordSafe || best.trimEnd()}..`;
}

function CaseStudyInformation({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [collapsedText, setCollapsedText] = useState(() => getInitialInformationText(paragraphs));
  const contentRef = useRef<HTMLDivElement | null>(null);
  const contentKey = paragraphs.join("\n");

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => {
      const firstParagraph = content.querySelector("p");
      const computed = window.getComputedStyle(firstParagraph ?? content);
      const fontSize = Number.parseFloat(computed.fontSize) || 15;
      const parsedLineHeight = Number.parseFloat(computed.lineHeight);
      const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.38;
      const collapsedHeight = lineHeight * INFORMATION_COLLAPSED_LINES;
      const nextCanExpand = content.scrollHeight > collapsedHeight + 1;

      setCanExpand(nextCanExpand);
      setCollapsedText(
        nextCanExpand
          ? getCollapsedInformationText(getDecodedInformationText(paragraphs), content, computed, collapsedHeight)
          : getDecodedInformationText(paragraphs),
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => observer.disconnect();
  }, [contentKey, paragraphs]);

  const showCollapsedPreview = !expanded && canExpand;

  return (
    <div className={styles.formaInformation}>
      <p className={styles.formaLabel}>(Information)</p>
      <div
        ref={contentRef}
        aria-hidden={showCollapsedPreview}
        className={`${styles.formaInformationCopy} ${showCollapsedPreview ? styles.formaInformationCopyMeasure : ""}`}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`} dangerouslySetInnerHTML={{ __html: paragraph }} />
        ))}
      </div>
      {showCollapsedPreview ? (
        <div className={`${styles.formaInformationCopy} ${styles.formaInformationPreview}`}>
          <p>{collapsedText}</p>
        </div>
      ) : null}
      {canExpand ? (
        <button
          aria-expanded={expanded}
          className={styles.formaInformationToggle}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? "See Less" : "See More"}
        </button>
      ) : null}
    </div>
  );
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
              <FormaFact label="Brand">{reference.brand}</FormaFact>
              <FormaFact label="Services">{reference.services.join(", ")}</FormaFact>
              <FormaFact label="Industry">{reference.industry}</FormaFact>
              <FormaFact label="Year">{reference.year}</FormaFact>
            </div>
            {reference.information.length > 0 ? (
              <CaseStudyInformation paragraphs={reference.information} />
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
                    imageSizes="(max-width: 900px) 80vw, 524px"
                    commentsVisible={commentsVisible}
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
                  <Image
                    src={project.image}
                    alt=""
                    width={698}
                    height={872}
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
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
                imageSizes="100vw"
                commentsVisible={commentsVisible}
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
      {hasAnyComments ? (
        <div className={styles.detailCommentToggleDock}>
          <button
            className={styles.detailCommentToggle}
            onClick={toggleCommentsVisibility}
            type="button"
            aria-pressed={commentsVisible}
            aria-label={commentsVisible ? "Hide comments (C)" : "Show comments (C)"}
          >
            <span className={styles.detailCommentToggleLabel}>
              {commentsVisible ? "Hide Comments" : "Show Comments"}
            </span>
            <span className={styles.detailCommentToggleKey} aria-hidden="true">
              C
            </span>
          </button>
        </div>
      ) : null}
    </main>
  );
}
