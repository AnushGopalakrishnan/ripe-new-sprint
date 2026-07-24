"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./page.module.css";

export default function CareersTrustLogos({ logos }: { logos: string[] }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
  }, []);

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
