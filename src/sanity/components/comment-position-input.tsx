"use client";

import { useCallback, useMemo, useRef } from "react";
import type { CSSProperties, PointerEvent } from "react";
import imageUrlBuilder from "@sanity/image-url";
import type { ObjectInputProps } from "sanity";
import { PatchEvent, set, unset, useFormValue } from "sanity";
import {
  sanityFallbackDataset,
  sanityFallbackProjectId,
} from "@/lib/env";

type CommentPositionValue = {
  _type?: string;
  x?: number;
  y?: number;
};

type SanityImageValue = {
  _type?: "image";
  asset?: {
    _ref?: string;
  };
};

type KeyedPathSegment = {
  _key: string;
};

type ImageCommentSection = {
  _key?: string;
  image?: SanityImageValue;
};

type CommentPlacementDocument = {
  imageSections?: ImageCommentSection[];
};

const imageBuilder = imageUrlBuilder({
  dataset: sanityFallbackDataset,
  projectId: sanityFallbackProjectId,
});

const surfaceStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(20, 20, 20, 0.08), rgba(20, 20, 20, 0.22)), linear-gradient(90deg, #f1ebe2 0 50%, #e2d7c9 50% 100%)",
  backgroundSize: "100% 100%, 2rem 2rem",
  border: "1px solid rgba(20, 20, 20, 0.2)",
  cursor: "crosshair",
  height: "min(22rem, 52vw)",
  minHeight: "14rem",
  overflow: "hidden",
  position: "relative",
  width: "100%",
};

const imageStyle: CSSProperties = {
  display: "block",
  height: "100%",
  inset: 0,
  objectFit: "cover",
  position: "absolute",
  width: "100%",
};

const imageOverlayStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.2))",
  inset: 0,
  pointerEvents: "none",
  position: "absolute",
};

const pinStyle: CSSProperties = {
  alignItems: "center",
  background: "#111",
  border: "2px solid #f1ebe2",
  borderRadius: "999px",
  boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.25)",
  color: "#f1ebe2",
  display: "flex",
  fontFamily: "monospace",
  fontSize: "0.6875rem",
  fontWeight: 700,
  height: "2rem",
  justifyContent: "center",
  left: "var(--comment-position-x)",
  pointerEvents: "none",
  position: "absolute",
  top: "var(--comment-position-y)",
  transform: "translate(-50%, -50%)",
  width: "2rem",
};

const metaStyle: CSSProperties = {
  color: "rgba(20, 20, 20, 0.66)",
  display: "flex",
  flexWrap: "wrap",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  gap: "0.75rem",
  justifyContent: "space-between",
  lineHeight: 1.4,
  marginTop: "0.625rem",
};

const buttonStyle: CSSProperties = {
  background: "transparent",
  border: "0",
  color: "inherit",
  cursor: "pointer",
  font: "inherit",
  padding: "0",
  textDecoration: "underline",
};

const missingImageStyle: CSSProperties = {
  alignItems: "center",
  color: "rgba(20, 20, 20, 0.66)",
  display: "flex",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  inset: 0,
  justifyContent: "center",
  lineHeight: 1.4,
  padding: "1rem",
  pointerEvents: "none",
  position: "absolute",
  textAlign: "center",
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function isKeyedPathSegment(segment: unknown): segment is KeyedPathSegment {
  return Boolean(
    segment &&
      typeof segment === "object" &&
      "_key" in segment &&
      typeof (segment as KeyedPathSegment)._key === "string",
  );
}

function getParentSectionImage(
  document: unknown,
  path: readonly unknown[] | undefined,
) {
  const imageSectionsIndex = path?.findIndex((segment) => segment === "imageSections") ?? -1;
  const sectionKeySegment =
    imageSectionsIndex >= 0 ? path?.[imageSectionsIndex + 1] : undefined;

  if (!isKeyedPathSegment(sectionKeySegment)) return undefined;

  const imageSections = (document as CommentPlacementDocument | undefined)?.imageSections;
  if (!Array.isArray(imageSections)) return undefined;

  return imageSections.find((section) => section._key === sectionKeySegment._key)?.image;
}

function getImageDimensions(image: SanityImageValue | undefined) {
  const ref = image?.asset?._ref;
  const match = ref?.match(/-(\d+)x(\d+)-[^-]+$/);
  if (!match) return undefined;

  return {
    height: Number(match[2]),
    width: Number(match[1]),
  };
}

function getImageUrl(image: SanityImageValue | undefined) {
  if (!image?.asset?._ref || sanityFallbackProjectId === "replace-me") return undefined;

  try {
    return imageBuilder.image(image).width(1600).fit("max").auto("format").url();
  } catch {
    return undefined;
  }
}

export function CommentPositionInput(props: ObjectInputProps<CommentPositionValue>) {
  const { onChange, path, value } = props;
  const document = useFormValue([]);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const x = typeof value?.x === "number" ? value.x : 50;
  const y = typeof value?.y === "number" ? value.y : 50;
  const hasValue = typeof value?.x === "number" && typeof value?.y === "number";
  const image = getParentSectionImage(document, path);
  const imageUrl = getImageUrl(image);
  const dimensions = getImageDimensions(image);

  const style = useMemo(
    () =>
      ({
        "--comment-position-x": `${x}%`,
        "--comment-position-y": `${y}%`,
        ...(dimensions
          ? { aspectRatio: `${dimensions.width} / ${dimensions.height}`, height: "auto" }
          : null),
      }) as CSSProperties,
    [dimensions, x, y],
  );

  const updateFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const surface = surfaceRef.current;
      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      const nextX = roundPercent(clampPercent(((event.clientX - rect.left) / rect.width) * 100));
      const nextY = roundPercent(clampPercent(((event.clientY - rect.top) / rect.height) * 100));

      onChange(
        PatchEvent.from(
          set({
            _type: value?._type ?? "commentPosition",
            x: nextX,
            y: nextY,
          }),
        ),
      );
    },
    [onChange, value?._type],
  );

  const resetPosition = useCallback(() => {
    onChange(PatchEvent.from(unset()));
  }, [onChange]);

  return (
    <div>
      <div
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          updateFromPointer(event);
        }}
        ref={surfaceRef}
        style={{ ...surfaceStyle, ...style }}
      >
        {imageUrl ? (
          <>
            <img alt="" draggable={false} src={imageUrl} style={imageStyle} />
            <div style={imageOverlayStyle} />
          </>
        ) : (
          <div style={missingImageStyle}>
            Add an image to this image section to place comments on it.
          </div>
        )}
        <div style={pinStyle}>C</div>
      </div>
      <div style={metaStyle}>
        <span>
          {hasValue
            ? `Saved as one object: { x: ${x.toFixed(1)}, y: ${y.toFixed(1)} }`
            : "Click the surface to set a position."}
        </span>
        {hasValue ? (
          <button onClick={resetPosition} style={buttonStyle} type="button">
            Clear position
          </button>
        ) : null}
      </div>
    </div>
  );
}
