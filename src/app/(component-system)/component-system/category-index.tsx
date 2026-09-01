"use client";

import { useEffect, useState } from "react";
import styles from "./component-system.module.css";

export type CategoryIndexItem = {
  id: string;
  label: string;
};

export function CategoryIndex({
  items,
  label,
}: Readonly<{
  items: readonly CategoryIndexItem[];
  label: string;
}>) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;
      const hashId = window.location.hash.slice(1);
      const sections = items
        .map(({ id }) => document.getElementById(id))
        .filter((section): section is HTMLElement => section !== null);
      if (!sections.length) return;

      const scrollMarker = 120;
      const hashTarget = hashId ? document.getElementById(hashId) : null;
      const hashTargetRect = hashTarget?.getBoundingClientRect();
      if (
        hashTargetRect &&
        hashTargetRect.bottom > scrollMarker &&
        hashTargetRect.top < window.innerHeight
      ) {
        setActiveId(hashId);
        return;
      }

      const visibleSection = sections.reduce((current, section) =>
        section.getBoundingClientRect().top <= scrollMarker ? section : current,
      sections[0]);

      setActiveId(visibleSection.id);
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [items]);

  return (
    <nav className={styles.categoryIndex} aria-label={label}>
      {items.map(({ id, label: itemLabel }) => (
        <a
          aria-current={activeId === id ? "location" : undefined}
          data-active={activeId === id ? "true" : "false"}
          href={`#${id}`}
          key={id}
          onClick={() => setActiveId(id)}
        >
          {itemLabel}
        </a>
      ))}
    </nav>
  );
}
