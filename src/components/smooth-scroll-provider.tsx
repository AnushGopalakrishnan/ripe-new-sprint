"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function SmoothScrollProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 0.82,
    });

    let frame = 0;

    function raf(time: number) {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    }

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, [pathname]);

  return null;
}
