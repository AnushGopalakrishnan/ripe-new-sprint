"use client";

import { useEffect } from "react";

export default function CareersTextMotion() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>("[data-careers-page]");
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-careers-reveal]"),
    );
    if (!page || targets.length === 0) return;

    page.dataset.textMotion = "ready";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((target) => {
        target.dataset.revealed = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return null;
}
