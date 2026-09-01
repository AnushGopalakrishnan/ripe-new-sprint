import type { CSSProperties } from "react";
import styles from "../component-system.module.css";

type MotionExampleStyle = CSSProperties & {
  "--motion-demo-duration": string;
  "--motion-demo-ease": string;
};

export function MotionExample({
  duration,
  easing = "cubic-bezier(.22, 1, .36, 1)",
}: Readonly<{
  duration: string;
  easing?: string;
  label: string;
}>) {
  const isInstant = duration === "0ms";

  return (
    <div
      aria-hidden="true"
      className={styles.motionExample}
      data-instant={isInstant ? "true" : "false"}
      style={{
        "--motion-demo-duration": isInstant ? "1200ms" : duration,
        "--motion-demo-ease": easing,
      } as MotionExampleStyle}
    >
      <span className={styles.motionTrack}>
        <span className={styles.motionMarker} />
      </span>
      <span className={styles.motionReplay}>Live</span>
    </div>
  );
}
