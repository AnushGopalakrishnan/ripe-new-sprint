"use client";

import styles from "@/components/media-player.module.css";
import { resolveVideoPoster } from "@/lib/video-poster";
import type { MediaAsset } from "@/types/content";
import { useEffect, useRef, useState } from "react";

type MediaPlayerProps = {
  media: MediaAsset;
  priority?: boolean;
};

export function MediaPlayer({ media }: MediaPlayerProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(media.kind !== "video");
  const [hasFrame, setHasFrame] = useState(false);
  const poster = resolveVideoPoster({ poster: media.poster, src: media.src });

  useEffect(() => {
    if (media.kind !== "video") return;
    if (shouldLoad) return;
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      {
        rootMargin: "360px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [media.kind, shouldLoad]);

  useEffect(() => {
    if (media.kind !== "video") {
      setShouldLoad(true);
      return;
    }

    setShouldLoad(false);
    setHasFrame(false);
  }, [media.kind, media.src]);

  return (
    <div
      ref={frameRef}
      className={styles.frame}
      data-video-ready={media.kind === "video" && (hasFrame || poster) ? "true" : undefined}
      data-video-loaded={media.kind === "video" && shouldLoad ? "true" : undefined}
    >
      {media.kind === "video" ? (
        <video
          className={`${styles.media} ${styles.videoMedia}`}
          autoPlay
          loop
          muted
          playsInline
          controls
          poster={poster}
          src={shouldLoad ? media.src : undefined}
          preload={shouldLoad ? "metadata" : "none"}
          onLoadedMetadata={() => setHasFrame(true)}
          onLoadedData={() => setHasFrame(true)}
          onCanPlay={() => setHasFrame(true)}
          onPlay={() => setHasFrame(true)}
          onError={() => setHasFrame(true)}
        >
          {shouldLoad ? <source src={media.src} type="application/vnd.apple.mpegurl" /> : null}
          {shouldLoad ? <source src={media.src} /> : null}
        </video>
      ) : (
        <img className={styles.image} src={media.src} alt={media.alt} />
      )}
      <div className={styles.overlay}>
        <div>
          {media.eyebrow ? (
            <p className={styles.eyebrow}>{media.eyebrow}</p>
          ) : null}
          <p className={styles.caption}>{media.alt}</p>
        </div>
        <span className="pill">
          {media.kind === "video" ? "Bunny/HLS-ready" : "Editorial media"}
        </span>
      </div>
    </div>
  );
}
