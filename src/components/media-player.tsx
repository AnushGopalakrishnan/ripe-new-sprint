import styles from "@/components/media-player.module.css";
import type { MediaAsset } from "@/types/content";

type MediaPlayerProps = {
  media: MediaAsset;
  priority?: boolean;
};

export function MediaPlayer({ media }: MediaPlayerProps) {
  return (
    <div className={styles.frame}>
      {media.kind === "video" ? (
        <video
          className={styles.media}
          autoPlay
          loop
          muted
          playsInline
          controls
          poster={media.poster}
        >
          <source src={media.src} type="application/vnd.apple.mpegurl" />
          <source src={media.src} />
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
