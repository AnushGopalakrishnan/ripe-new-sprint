"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { FocusEvent } from "react";
import type { WorkJournalItem } from "@/data/work-journal";
import styles from "./work-journal-section.module.css";

type WorkJournalSectionProps = {
  filters: string[];
  items: WorkJournalItem[];
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) return [255, 255, 255];
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function luminance([r, g, b]: number[]) {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function needsLightText(color: string) {
  return luminance(hexToRgb(color)) <= 0.45;
}

export function WorkJournalSection({ filters, items }: WorkJournalSectionProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const clearThemeTimer = useRef<number | null>(null);
  const visibleItems = useMemo(() => {
    if (!activeFilters.length) return items;
    return items.filter((item) => activeFilters.some((filter) => item.tags.includes(filter)));
  }, [activeFilters, items]);
  const filterKey = activeFilters.join("|") || "all";

  useEffect(() => {
    return () => {
      if (clearThemeTimer.current) window.clearTimeout(clearThemeTimer.current);
      document.body.classList.remove(styles.themeActive, styles.themeFading, styles.themeReady);
      document.body.style.removeProperty("--work-journal-theme");
      document.body.removeAttribute("data-work-journal-tone");
    };
  }, []);

  function toggleFilter(filter: string) {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
  }

  function applyTheme(color: string) {
    if (clearThemeTimer.current) {
      window.clearTimeout(clearThemeTimer.current);
      clearThemeTimer.current = null;
    }

    const tone = needsLightText(color) ? "light" : "dark";
    document.body.style.setProperty("--work-journal-theme", color);
    document.body.setAttribute("data-work-journal-tone", tone);
    document.body.classList.remove(styles.themeFading);
    document.body.classList.add(styles.themeActive, styles.themeReady);
  }

  function clearTheme() {
    setHoveredSlug(null);
    document.body.classList.remove(styles.themeActive);
    document.body.classList.add(styles.themeFading);
    clearThemeTimer.current = window.setTimeout(() => {
      if (document.body.classList.contains(styles.themeFading)) {
        document.body.classList.remove(styles.themeFading);
        document.body.style.removeProperty("--work-journal-theme");
        document.body.removeAttribute("data-work-journal-tone");
      }
      clearThemeTimer.current = null;
    }, 180);
  }

  function handleGridBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    clearTheme();
  }

  return (
    <section className={styles.section} aria-label="Work journal">
      <div className={styles.filters} aria-label="Work filters">
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter);

          return (
            <button
              key={filter}
              type="button"
              className={styles.filterButton}
              data-active={isActive}
              aria-pressed={isActive}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className={styles.themeOverlay} aria-hidden="true" />

      <div
        key={filterKey}
        className={styles.grid}
        data-count={visibleItems.length}
        data-filter-key={filterKey}
        data-hovering={hoveredSlug ? "true" : "false"}
        onPointerLeave={clearTheme}
        onBlur={handleGridBlur}
      >
        {visibleItems.map((item, index) => (
          <a
            key={item.slug}
            className={styles.card}
            data-hovered={hoveredSlug === item.slug}
            href={`/case-studies/${item.slug}`}
            style={{ "--index": index } as CSSProperties}
            onPointerEnter={() => {
              setHoveredSlug(item.slug);
              applyTheme(item.accentColor ?? "#dedede");
            }}
            onFocus={() => {
              setHoveredSlug(item.slug);
              applyTheme(item.accentColor ?? "#dedede");
            }}
          >
            <div className={styles.media}>
              <img className={styles.image} src={item.image} alt={item.title} loading={index < 4 ? "eager" : "lazy"} />
              <div
                className={styles.overlay}
                style={
                  {
                    "--accent": item.accentColor ?? "rgb(79, 79, 79)",
                  } as CSSProperties
                }
              />
              <div className={styles.tag}>{item.tags[0] ?? "Work"}</div>
            </div>
            <h2 className={styles.title}>{item.title}</h2>
            {item.description ? <p className={styles.description}>{item.description}</p> : null}
          </a>
        ))}
        {!visibleItems.length ? <p className={styles.empty}>No work matches the selected filters.</p> : null}
      </div>
    </section>
  );
}
