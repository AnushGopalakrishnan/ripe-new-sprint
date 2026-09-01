"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicComponentId } from "@/components/component-system/registry";
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

export function SpecimenStage({
  id,
  name,
  sourcePath,
}: Readonly<{
  id: PublicComponentId;
  name: string;
  sourcePath: string;
}>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isTuning, setIsTuning] = useState(false);
  const [viewport, setViewport] = useState("Full");

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

  return (
    <div className={styles.stageShell}>
      <div className={styles.surfaceMeta}>
        <span className={styles.surfaceLabel}>Live component surface</span>
        <div className={styles.surfaceActions}>
          <code className={styles.surfaceSource}>{sourcePath}</code>
          <button
            aria-pressed={isTuning}
            className={styles.tuneButton}
            onClick={() => setIsTuning((current) => !current)}
            type="button"
          >
            {isTuning ? "Close controls" : "Tune"}
          </button>
        </div>
      </div>
      <div className={styles.frameViewport}>
        <iframe
          ref={iframeRef}
          allow="autoplay; clipboard-write; fullscreen"
          allowFullScreen
          className={styles.stageFrame}
          data-component-frame={id}
          loading="eager"
          src={`/component-system/specimens/${id}${isTuning ? "?dialkit=1" : ""}`}
          style={{ width: viewportWidths[viewport] ?? viewportWidths.Full }}
          title={`${name} live component surface`}
        />
      </div>
    </div>
  );
}
