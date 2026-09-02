"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RipeLogo } from "@/components/public-navigation";
import styles from "@/components/site-preloader.module.css";

const completionFallbackMs = 450;
const filledLogoHoldMs = 140;
const minimumProgressMs = 900;
const progressIntervalMs = 50;

export function SitePreloader() {
  const [dismissed, setDismissed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shrinking, setShrinking] = useState(false);
  const coverRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const navigationLogoRef = useRef<HTMLElement | null>(null);
  const startedRef = useRef(false);
  const unlockScrollRef = useRef<() => void>(() => undefined);

  const dismiss = useCallback(() => {
    unlockScrollRef.current();
    unlockScrollRef.current = () => undefined;
    setDismissed(true);
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const mark = markRef.current;
    const navigationLogo = navigationLogoRef.current;
    if (mark && navigationLogo) {
      const source = mark.getBoundingClientRect();
      const target = navigationLogo.getBoundingClientRect();
      const balancedPauseEdge = target.bottom + target.top;

      coverRef.current?.style.setProperty(
        "--preloader-pause-edge",
        `${balancedPauseEdge}px`
      );
      mark.style.setProperty(
        "--preloader-logo-x",
        `${target.left - source.left}px`
      );
      mark.style.setProperty(
        "--preloader-logo-y",
        `${target.top - source.top}px`
      );
      mark.style.setProperty(
        "--preloader-logo-scale",
        `${target.height / source.height}`
      );
      mark.style.color = window.getComputedStyle(navigationLogo).color;
    }

    window.requestAnimationFrame(() => setPlaying(true));
  }, []);

  useEffect(() => {
    if (progress !== 100) return;

    const filledLogoHold = window.setTimeout(
      () => setShrinking(true),
      filledLogoHoldMs
    );
    return () => window.clearTimeout(filledLogoHold);
  }, [progress]);

  useEffect(() => {
    if (!shrinking) return;

    const mark = markRef.current;
    const handleShrinkEnd = (event: TransitionEvent) => {
      if (event.target === mark && event.propertyName === "transform") start();
    };
    mark?.addEventListener("transitionend", handleShrinkEnd);
    const completionFallback = window.setTimeout(start, completionFallbackMs);

    return () => {
      mark?.removeEventListener("transitionend", handleShrinkEnd);
      window.clearTimeout(completionFallback);
    };
  }, [shrinking, start]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDismissed(true);
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const navigationLogo = document.querySelector<HTMLElement>(
      "[data-navigation-logo]"
    );
    const previousLogoVisibility = navigationLogo?.style.visibility ?? "";

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    navigationLogoRef.current = navigationLogo;
    if (navigationLogo) navigationLogo.style.visibility = "hidden";

    const progressStartedAt = window.performance.now();
    let cancelled = false;
    let pageReady = document.readyState === "complete";
    let progressTarget = 32;

    const markPageReady = () => {
      pageReady = true;
      progressTarget = 100;
    };

    if (document.readyState === "complete") {
      markPageReady();
    } else {
      window.addEventListener("load", markPageReady, { once: true });
    }

    document.fonts.ready.then(() => {
      if (!cancelled) progressTarget = Math.max(progressTarget, 68);
    });

    const progressTimer = window.setInterval(() => {
      const minimumElapsed =
        window.performance.now() - progressStartedAt >= minimumProgressMs;
      const displayedTarget = pageReady
        ? minimumElapsed
          ? 100
          : 92
        : progressTarget;

      setProgress((current) => {
        if (current >= displayedTarget) return current;
        const remaining = displayedTarget - current;
        const step = Math.max(1, Math.ceil(remaining * 0.16));
        return Math.min(displayedTarget, current + step);
      });
    }, progressIntervalMs);

    const unlockScroll = () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      window.removeEventListener("load", markPageReady);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      if (navigationLogo)
        navigationLogo.style.visibility = previousLogoVisibility;
      navigationLogoRef.current = null;
    };
    unlockScrollRef.current = unlockScroll;

    return unlockScroll;
  }, []);

  if (dismissed) return null;

  return (
    <>
      <section
        aria-label="Loading Ripe Studios"
        className={styles.cover}
        data-playing={playing ? "true" : "false"}
        data-site-preloader=""
        onAnimationEnd={(event) => {
          if (event.currentTarget === event.target) dismiss();
        }}
        ref={coverRef}
        role="status"
      >
        <p aria-hidden="true" className={styles.note}>
          {progress}%
        </p>
      </section>
      <span
        aria-hidden="true"
        className={styles.mark}
        data-complete={shrinking ? "true" : "false"}
        data-playing={playing ? "true" : "false"}
        data-site-preloader-logo=""
        ref={markRef}
        style={{ "--preloader-logo-progress": `${progress}%` } as CSSProperties}
      >
        <span className={`${styles.logoLayer} ${styles.logoBase}`}>
          <RipeLogo />
        </span>
        <span
          className={`${styles.logoLayer} ${styles.logoFill}`}
          data-site-preloader-logo-fill=""
        >
          <RipeLogo />
        </span>
      </span>
    </>
  );
}
