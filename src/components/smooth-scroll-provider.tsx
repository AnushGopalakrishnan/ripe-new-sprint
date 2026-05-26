"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function SmoothScrollProvider() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 0.82,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = window.requestAnimationFrame(raf);
    }

    rafRef.current = window.requestAnimationFrame(raf);

    function refreshLenisDimensions() {
      lenis.resize();
    }

    window.addEventListener("resize", refreshLenisDimensions);
    window.addEventListener("load", refreshLenisDimensions);
    document.fonts?.ready.then(refreshLenisDimensions);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", refreshLenisDimensions);
      window.removeEventListener("load", refreshLenisDimensions);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    window.requestAnimationFrame(() => {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.resize();
    });

    const resizeTimeouts = [180, 650, 1400].map((delay) =>
      window.setTimeout(() => {
        lenisRef.current?.resize();
      }, delay),
    );

    const onMediaReady = () => {
      lenisRef.current?.resize();
    };

    const mediaNodes = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video"));
    for (const mediaNode of mediaNodes) {
      if (mediaNode instanceof HTMLImageElement) {
        if (!mediaNode.complete) {
          mediaNode.addEventListener("load", onMediaReady);
          mediaNode.addEventListener("error", onMediaReady);
        }
        continue;
      }

      if (mediaNode.readyState < 1) {
        mediaNode.addEventListener("loadedmetadata", onMediaReady);
        mediaNode.addEventListener("error", onMediaReady);
      }
    }

    return () => {
      for (const timeoutId of resizeTimeouts) {
        window.clearTimeout(timeoutId);
      }

      for (const mediaNode of mediaNodes) {
        mediaNode.removeEventListener("load", onMediaReady);
        mediaNode.removeEventListener("loadedmetadata", onMediaReady);
        mediaNode.removeEventListener("error", onMediaReady);
      }
    };
  }, [pathname]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, [pathname]);

  return null;
}
