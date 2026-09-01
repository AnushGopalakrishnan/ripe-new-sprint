"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaseStudyCommentNote } from "@/components/case-study-comment-note";
import { CaseStudyLongFormPlayer } from "@/components/case-study-long-form-player";

export type CaseStudyMediaKind = "auto" | "image" | "video";

export type CaseStudyMediaComment = {
  id: string;
  author: string;
  avatar?: string;
  body: string;
  x: number;
  y: number;
  createdAt: string;
};

export type CaseStudyMediaData = {
  src: string;
  alt: string;
  kind?: CaseStudyMediaKind;
  poster?: string;
  longForm?: {
    enabled: boolean;
    hlsUrl?: string;
  };
  comments?: CaseStudyMediaComment[];
};

export type CaseStudyMediaProps = {
  sectionId: string;
  media: CaseStudyMediaData;
  mediaClassName: string;
  load?: "lazy" | "eager";
  priority?: boolean;
  fitMode?: "cover" | "contain";
  imageSizes?: string;
  commentsVisible?: boolean;
  styles: Record<string, string>;
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

const videoExtensions = new Set(["mp4", "webm", "mov", "m4v", "ogv", "ogg", "m3u8"]);

function parsePathname(src: string) {
  try {
    return new URL(src).pathname;
  } catch {
    return src;
  }
}

function getMediaKind(src: string, kind: CaseStudyMediaKind = "auto") {
  if (kind !== "auto") return kind;
  if (src.startsWith("data:video/")) return "video";

  const pathname = parsePathname(src).toLowerCase();
  const extension = pathname.split(".").pop() ?? "";
  return videoExtensions.has(extension) ? "video" : "image";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function CaseStudyMedia({
  styles,
  sectionId,
  media,
  mediaClassName,
  load = "lazy",
  priority = false,
  fitMode = "cover",
  imageSizes = "100vw",
  commentsVisible = true,
}: CaseStudyMediaProps) {
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
        return (
          <CaseStudyCommentNote
            key={comment.id}
            comment={comment}
            index={index}
            isActive={isActive}
            x={x}
            y={y}
            expandLeft={position.x > 50}
            expandDown={position.y <= 50}
            styles={styles}
            buttonProps={{
              onBlur: () => {
                setActiveId((prev) => (prev === comment.id ? null : prev));
              },
              onClick: (event) => {
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
              },
              onFocus: () => openComment(comment.id),
              onPointerDown: (event) => {
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
              },
              onPointerEnter: (event) => {
                if (event.pointerType !== "touch") openComment(comment.id);
              },
              onPointerLeave: (event) => {
                if (event.pointerType !== "touch") closeComment(comment.id);
              },
              onPointerMove: (event) => {
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
              },
              onPointerUp: (event) => {
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
              },
              onTouchEnd: (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (suppressNextTouchRef.current) {
                  suppressNextTouchRef.current = false;
                  return;
                }
                lastPointerTypeRef.current = "touch";
                setActiveId((prev) => (prev === comment.id ? null : comment.id));
              },
            }}
          />
        );
      })
        : null}
    </div>
  );
}
