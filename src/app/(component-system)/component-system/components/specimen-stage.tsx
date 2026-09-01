"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicComponentId } from "@/components/component-system/registry";
import type { PublicComponentCategory } from "@/components/component-system/registry";
import styles from "../component-system.module.css";

const viewportWidths: Record<string, string> = {
  Full: "100%",
  Desktop: "min(100%, 90rem)",
  Tablet: "min(100%, 48rem)",
  Mobile: "min(100%, 24.375rem)",
};

type SurfaceMessage = {
  type: "ripe:component-specimen-surface";
  id: PublicComponentId;
  viewport: string;
};

type ResizeMessage = {
  type: "ripe:component-specimen-resize";
  id: PublicComponentId;
  height: number;
};

type VariantMessage = {
  type: "ripe:component-specimen-variant";
  id: PublicComponentId;
  variant: string;
};

export function SpecimenStage({
  category,
  id,
  name,
  selectedVariant,
  sourcePath,
}: Readonly<{
  id: PublicComponentId;
  category: PublicComponentCategory;
  name: string;
  selectedVariant: string;
  sourcePath: string;
}>) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const measurementContextRef = useRef({ selectedVariant, viewport: "Full" });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTuning, setIsTuning] = useState(false);
  const [viewport, setViewport] = useState("Full");
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldLoad = Boolean(entry?.isIntersecting);
        setIsLoaded(shouldLoad);
        if (!shouldLoad) {
          setIsTuning(false);
          setViewport("Full");
        }
      },
      { rootMargin: "50% 0px 50% 0px", threshold: 0.01 },
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const receiveSurfaceSettings = (event: MessageEvent<SurfaceMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow ||
        event.data?.type !== "ripe:component-specimen-surface" ||
        event.data.id !== id
      ) return;

      setViewport(event.data.viewport);
    };

    window.addEventListener("message", receiveSurfaceSettings);
    return () => window.removeEventListener("message", receiveSurfaceSettings);
  }, [id]);

  useEffect(() => {
    const receiveContentHeight = (event: MessageEvent<ResizeMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow ||
        event.data?.type !== "ripe:component-specimen-resize" ||
        event.data.id !== id ||
        !Number.isFinite(event.data.height)
      ) return;

      setContentHeight(Math.min(50_000, Math.max(0, Math.ceil(event.data.height))));
    };

    window.addEventListener("message", receiveContentHeight);
    return () => window.removeEventListener("message", receiveContentHeight);
  }, [id]);

  useEffect(() => {
    const previous = measurementContextRef.current;
    const contextChanged = previous.selectedVariant !== selectedVariant || previous.viewport !== viewport;
    measurementContextRef.current = { selectedVariant, viewport };
    if (isLoaded && contextChanged) setContentHeight(null);
  }, [isLoaded, selectedVariant, viewport]);

  const publishDialKitState = useCallback((enabled: boolean) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "ripe:component-specimen-dialkit", id, enabled },
      window.location.origin,
    );
  }, [id]);

  const publishVariant = useCallback((variant: string) => {
    const message: VariantMessage = {
      type: "ripe:component-specimen-variant",
      id,
      variant,
    };
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, [id]);

  useEffect(() => {
    if (!isLoaded) return;
    publishDialKitState(isTuning);
  }, [isLoaded, isTuning, publishDialKitState]);

  useEffect(() => {
    if (!isLoaded) return;
    publishVariant(selectedVariant);
  }, [isLoaded, publishVariant, selectedVariant]);

  return (
    <div className={styles.stageShell} ref={stageRef}>
      <div className={styles.frameViewport}>
        {isLoaded ? (
          <iframe
            ref={iframeRef}
            allow="autoplay; clipboard-write; fullscreen"
            allowFullScreen
            className={styles.stageFrame}
            data-component-category={category}
            data-component-frame={id}
            onLoad={() => {
              publishDialKitState(isTuning);
              publishVariant(selectedVariant);
            }}
            src={`/component-system/specimens/${id}`}
            style={{
              height: contentHeight === null ? undefined : `${contentHeight}px`,
              width: viewportWidths[viewport] ?? viewportWidths.Full,
            }}
            title={`${name} live component surface`}
          />
        ) : (
          <div
            className={`${styles.stageFrame} ${styles.previewPlaceholder}`}
            data-component-category={category}
            style={{ height: contentHeight === null ? undefined : `${contentHeight}px` }}
          >
            Preview loads as it approaches the viewport
          </div>
        )}
      </div>
      <div className={styles.surfaceMeta}>
        <code className={styles.surfaceSource}>{sourcePath}</code>
        <div className={styles.surfaceActions}>
          <span className={styles.surfaceLabel} data-loaded={isLoaded ? "true" : "false"}>
            <span className={styles.surfaceLabelText}>Live component surface</span>
          </span>
          {isLoaded ? (
            <button
              aria-pressed={isTuning}
              className={styles.tuneButton}
              onClick={() => setIsTuning((current) => !current)}
              type="button"
            >
              {isTuning ? "Close controls" : "Tune"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
