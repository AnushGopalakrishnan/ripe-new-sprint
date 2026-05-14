"use client";

import { useEffect, useRef } from "react";
import styles from "./home-motion-hero.module.css";

export function HomeMotionHero() {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    let frame = 0;
    let current = 0;
    let target = 0;

    const updateTarget = (event: PointerEvent) => {
      const normalizedY = event.clientY / window.innerHeight - 0.5;
      target = normalizedY * 18;
    };

    const tick = () => {
      current += (target - current) * 0.085;
      row.style.setProperty("--hero-motion-y", `${current}vh`);
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", updateTarget, { passive: true });
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", updateTarget);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.hero} data-theme-section="light">
      <div className={styles.row} ref={rowRef}>
        <h1 className={styles.word}>Ripe</h1>
        <div className={styles.mediaWrap}>
          <img
            alt=""
            className={styles.media}
            draggable={false}
            src="/experiments/home-motion-hero-shoes.png"
          />
          <button className={styles.playButton} type="button">
            <span className={styles.playIcon} aria-hidden="true" />
            <span>Play Showreel</span>
          </button>
        </div>
        <p className={styles.outcome}>
          The Natural
          <br />
          Outcome
        </p>
      </div>
    </section>
  );
}
