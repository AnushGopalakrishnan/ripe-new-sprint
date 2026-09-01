"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type CareersTrustLogosProps = {
  logos: string[];
  reveal?: "auto" | "entering" | "visible";
  styles: Record<string, string>;
};

export function CareersTrustLogos({ logos, reveal = "auto", styles }: CareersTrustLogosProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(reveal === "visible");

  useEffect(() => {
    if (reveal !== "auto") return;
    const stack = stackRef.current;
    if (!stack) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(stack);
    return () => observer.disconnect();
  }, [reveal]);

  return (
    <div
      ref={stackRef}
      className={styles.avatarStack}
      data-visible={isVisible ? "true" : "false"}
      aria-hidden="true"
    >
      {logos.map((logo, index) => (
        <img
          key={logo}
          src={logo}
          alt=""
          loading="lazy"
          style={{ "--logo-index": index } as CSSProperties}
        />
      ))}
    </div>
  );
}
