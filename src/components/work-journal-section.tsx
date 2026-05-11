"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { FocusEvent } from "react";
import type { WorkJournalItem } from "@/data/work-journal";
import type { WorkJournalViewMode } from "@/lib/work-journal-url-state";
import styles from "./work-journal-section.module.css";

const VIEW_EXIT_MS = 260;
const VIEW_ENTER_MS = 1100;
const LIST_PREVIEW_ENTER_MS = 760;
const THEME_GRADIENT_WHITE_STOP = 0.7;
const MOBILE_MEDIA_QUERY = "(max-width: 50.5625em)";

type WorkJournalSectionProps = {
  filters: string[];
  initialFilters?: string[];
  initialViewMode?: WorkJournalViewMode;
  items: WorkJournalItem[];
  layout?: "standard" | "alternating";
};

type ViewTransitionPhase = "idle" | "exiting" | "entering";
type TextTone = "dark" | "light";

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

function mixRgb(from: number[], to: number[], progress: number) {
  return from.map((channel, index) => channel + (to[index] - channel) * progress);
}

function toneForBackground(background: number[]): TextTone {
  return luminance(background) <= 0.45 ? "light" : "dark";
}

export function WorkJournalSection({
  filters,
  initialFilters = [],
  initialViewMode = "grid",
  items,
  layout = "standard",
}: WorkJournalSectionProps) {
  const getInitialFilters = () => filters.filter((filter) => initialFilters.includes(filter));
  const [activeFilters, setActiveFilters] = useState<string[]>(getInitialFilters);
  const [displayedFilters, setDisplayedFilters] = useState<string[]>(getInitialFilters);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [committedViewMode, setCommittedViewMode] = useState<WorkJournalViewMode>(initialViewMode);
  const [viewMode, setViewMode] = useState<WorkJournalViewMode>(initialViewMode);
  const [viewTransitionPhase, setViewTransitionPhase] = useState<ViewTransitionPhase>("idle");
  const [hasCompletedViewTransition, setHasCompletedViewTransition] = useState(false);
  const committedViewModeRef = useRef<WorkJournalViewMode>(initialViewMode);
  const activeFiltersRef = useRef<string[]>(getInitialFilters());
  const clearThemeTimer = useRef<number | null>(null);
  const filterExitTimer = useRef<number | null>(null);
  const filterEnterTimer = useRef<number | null>(null);
  const listPreviewEntryTimer = useRef<number | null>(null);
  const listPreviewHasAnimatedRef = useRef(false);
  const listPreviewEntrySlugRef = useRef<string | null>(null);
  const themeCleanupTimer = useRef<number | null>(null);
  const textToneAnimationFrame = useRef<number | null>(null);
  const mobileScrollAnimationFrame = useRef<number | null>(null);
  const viewExitTimer = useRef<number | null>(null);
  const viewEnterTimer = useRef<number | null>(null);
  const activeThemeColorRef = useRef<string | null>(null);
  const cardElementsRef = useRef(new Map<string, HTMLAnchorElement>());
  const clearThemeRef = useRef<() => void>(() => {});
  const handleCardEnterRef = useRef<(item: WorkJournalItem) => void>(() => {});
  const viewModeRef = useRef<WorkJournalViewMode>(initialViewMode);
  const viewTransitionPhaseRef = useRef<ViewTransitionPhase>("idle");
  const hoveredSlugRef = useRef<string | null>(null);
  const pendingDisplayedFiltersRef = useRef<string[]>(getInitialFilters());
  const transitionTargetRef = useRef<WorkJournalViewMode | null>(null);
  const visibleItemsRef = useRef<WorkJournalItem[]>([]);
  const isMobileViewportRef = useRef(false);
  const [isViewButtonPreviewed, setIsViewButtonPreviewed] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [listPreviewEntrySlug, setListPreviewEntrySlug] = useState<string | null>(null);
  const [cardTextTones, setCardTextTones] = useState<Record<string, TextTone>>({});
  const visibleItems = useMemo(() => {
    if (!displayedFilters.length) return items;
    return items.filter((item) => displayedFilters.some((filter) => item.tags.includes(filter)));
  }, [displayedFilters, items]);
  const filterKey = displayedFilters.join("|") || "all";

  useEffect(() => {
    visibleItemsRef.current = visibleItems;
  }, [visibleItems]);

  useEffect(() => {
    const url = new URL(window.location.href);

    url.searchParams.set("view", committedViewMode);

    if (activeFilters.length) {
      url.searchParams.set("filters", activeFilters.join(","));
    } else {
      url.searchParams.delete("filters");
    }

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) window.history.replaceState(null, "", nextUrl);
  }, [activeFilters, committedViewMode]);

  function commitViewMode(nextMode: WorkJournalViewMode) {
    committedViewModeRef.current = nextMode;
    setCommittedViewMode(nextMode);
  }

  function updateViewMode(nextMode: WorkJournalViewMode) {
    viewModeRef.current = nextMode;
    setViewMode(nextMode);
  }

  function updateViewTransitionPhase(nextPhase: ViewTransitionPhase) {
    viewTransitionPhaseRef.current = nextPhase;
    setViewTransitionPhase(nextPhase);
  }

  function updateActiveFilters(nextFilters: string[]) {
    activeFiltersRef.current = nextFilters;
    setActiveFilters(nextFilters);
  }

  const scheduleCardTextToneUpdate = useCallback((color: string) => {
    activeThemeColorRef.current = color;
    if (textToneAnimationFrame.current) window.cancelAnimationFrame(textToneAnimationFrame.current);

    textToneAnimationFrame.current = window.requestAnimationFrame(() => {
      const themeRgb = hexToRgb(color);
      const whiteRgb = [255, 255, 255];
      const nextTones: Record<string, TextTone> = {};

      for (const [slug, card] of cardElementsRef.current) {
        const textTarget = card.querySelector<HTMLElement>(`.${styles.title}`) ?? card;
        const rect = textTarget.getBoundingClientRect();
        const yFraction = Math.min(Math.max(rect.top / window.innerHeight, 0), 1);
        const progress = Math.min(yFraction / THEME_GRADIENT_WHITE_STOP, 1);
        const background = mixRgb(themeRgb, whiteRgb, progress);
        nextTones[slug] = toneForBackground(background);
      }

      setCardTextTones((current) => {
        const currentEntries = Object.entries(current);
        const nextEntries = Object.entries(nextTones);
        if (
          currentEntries.length === nextEntries.length &&
          nextEntries.every(([slug, tone]) => current[slug] === tone)
        ) {
          return current;
        }

        return nextTones;
      });
      textToneAnimationFrame.current = null;
    });
  }, []);

  useEffect(() => {
    document.body.classList.add(styles.workJournalPage);

    function updateTextTonesOnViewportChange() {
      if (activeThemeColorRef.current) scheduleCardTextToneUpdate(activeThemeColorRef.current);
    }

    window.addEventListener("resize", updateTextTonesOnViewportChange);
    window.addEventListener("scroll", updateTextTonesOnViewportChange, { passive: true });

    return () => {
      if (clearThemeTimer.current) window.clearTimeout(clearThemeTimer.current);
      if (filterExitTimer.current) window.clearTimeout(filterExitTimer.current);
      if (filterEnterTimer.current) window.clearTimeout(filterEnterTimer.current);
      if (listPreviewEntryTimer.current) window.clearTimeout(listPreviewEntryTimer.current);
      if (themeCleanupTimer.current) window.clearTimeout(themeCleanupTimer.current);
      if (textToneAnimationFrame.current) window.cancelAnimationFrame(textToneAnimationFrame.current);
      if (mobileScrollAnimationFrame.current) window.cancelAnimationFrame(mobileScrollAnimationFrame.current);
      if (viewExitTimer.current) window.clearTimeout(viewExitTimer.current);
      if (viewEnterTimer.current) window.clearTimeout(viewEnterTimer.current);
      window.removeEventListener("resize", updateTextTonesOnViewportChange);
      window.removeEventListener("scroll", updateTextTonesOnViewportChange);
      document.body.classList.remove(styles.workJournalPage, styles.themeActive, styles.themeFading, styles.themeReady);
      document.body.style.removeProperty("--work-journal-theme");
      document.body.removeAttribute("data-work-journal-tone");
    };
  }, [scheduleCardTextToneUpdate]);

  useEffect(() => {
    if (!isMobileFilterOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add(styles.mobileFilterOpen);

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileFilterOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove(styles.mobileFilterOpen);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileFilterOpen]);

  function updateHoveredSlug(nextSlug: string | null) {
    hoveredSlugRef.current = nextSlug;
    setHoveredSlug(nextSlug);
  }

  function updateListPreviewEntrySlug(nextSlug: string | null) {
    listPreviewEntrySlugRef.current = nextSlug;
    setListPreviewEntrySlug(nextSlug);
  }

  function resetListPreviewSession() {
    if (listPreviewEntryTimer.current) {
      window.clearTimeout(listPreviewEntryTimer.current);
      listPreviewEntryTimer.current = null;
    }
    listPreviewHasAnimatedRef.current = false;
    updateListPreviewEntrySlug(null);
  }

  function runFilterTransition() {
    updateHoveredSlug(null);
    resetListPreviewSession();
    setHasCompletedViewTransition(false);
    updateViewTransitionPhase("exiting");

    filterExitTimer.current = window.setTimeout(() => {
      setDisplayedFilters(pendingDisplayedFiltersRef.current);
      updateViewTransitionPhase("entering");
      filterExitTimer.current = null;

      filterEnterTimer.current = window.setTimeout(() => {
        setHasCompletedViewTransition(true);
        updateViewTransitionPhase("idle");
        filterEnterTimer.current = null;
      }, VIEW_ENTER_MS);
    }, VIEW_EXIT_MS);
  }

  function toggleFilter(filter: string) {
    if (transitionTargetRef.current) return;
    const nextFilters = activeFiltersRef.current.includes(filter)
      ? activeFiltersRef.current.filter((item) => item !== filter)
      : [...activeFiltersRef.current, filter];

    updateActiveFilters(nextFilters);
    pendingDisplayedFiltersRef.current = nextFilters;

    if (viewTransitionPhaseRef.current === "exiting") return;

    if (filterEnterTimer.current) {
      window.clearTimeout(filterEnterTimer.current);
      filterEnterTimer.current = null;
    }

    runFilterTransition();
  }

  function switchViewMode(nextMode: WorkJournalViewMode, options: { persist?: boolean } = {}) {
    if (nextMode === viewModeRef.current || viewTransitionPhaseRef.current !== "idle") return;
    if (options.persist) commitViewMode(nextMode);
    updateHoveredSlug(null);
    resetListPreviewSession();
    if (nextMode === "list") clearTheme();
    setHasCompletedViewTransition(false);
    transitionTargetRef.current = nextMode;
    updateViewTransitionPhase("exiting");

    viewExitTimer.current = window.setTimeout(() => {
      updateViewMode(nextMode);
      updateViewTransitionPhase("entering");
      viewExitTimer.current = null;

      viewEnterTimer.current = window.setTimeout(() => {
        setHasCompletedViewTransition(true);
        updateViewTransitionPhase("idle");
        transitionTargetRef.current = null;
        viewEnterTimer.current = null;
      }, VIEW_ENTER_MS);
    }, VIEW_EXIT_MS);
  }

  function handleViewToggleEnter() {
    setIsViewButtonPreviewed(true);
  }

  function handleViewToggleLeave() {
    setIsViewButtonPreviewed(false);
  }

  function handleViewToggleClick() {
    if (viewTransitionPhaseRef.current !== "idle") return;
    switchViewMode(nextViewMode, { persist: true });
  }

  function applyTheme(color: string) {
    if (clearThemeTimer.current) {
      window.clearTimeout(clearThemeTimer.current);
      clearThemeTimer.current = null;
    }
    if (themeCleanupTimer.current) {
      window.clearTimeout(themeCleanupTimer.current);
      themeCleanupTimer.current = null;
    }

    const tone = needsLightText(color) ? "light" : "dark";
    document.body.style.setProperty("--work-journal-theme", color);
    document.body.setAttribute("data-work-journal-tone", tone);
    document.body.classList.remove(styles.themeFading);
    document.body.classList.add(styles.themeActive, styles.themeReady);
    scheduleCardTextToneUpdate(color);
  }

  function clearTheme() {
    if (clearThemeTimer.current) window.clearTimeout(clearThemeTimer.current);
    clearThemeTimer.current = window.setTimeout(() => {
      updateHoveredSlug(null);
      resetListPreviewSession();
      document.body.classList.remove(styles.themeActive);
      document.body.classList.add(styles.themeFading);
      clearThemeTimer.current = null;
      themeCleanupTimer.current = window.setTimeout(() => {
        if (document.body.classList.contains(styles.themeFading)) {
          document.body.classList.remove(styles.themeFading);
          document.body.style.removeProperty("--work-journal-theme");
          document.body.removeAttribute("data-work-journal-tone");
          activeThemeColorRef.current = null;
          setCardTextTones({});
        }
        themeCleanupTimer.current = null;
      }, 180);
    }, 120);
  }

  function handleGridBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    clearTheme();
  }

  function handleCardEnter(item: WorkJournalItem) {
    if (clearThemeTimer.current) {
      window.clearTimeout(clearThemeTimer.current);
      clearThemeTimer.current = null;
    }

    if (viewModeRef.current === "list") {
      if (!listPreviewHasAnimatedRef.current) {
        listPreviewHasAnimatedRef.current = true;
        updateListPreviewEntrySlug(item.slug);
        if (listPreviewEntryTimer.current) window.clearTimeout(listPreviewEntryTimer.current);
        listPreviewEntryTimer.current = window.setTimeout(() => {
          updateListPreviewEntrySlug(null);
          listPreviewEntryTimer.current = null;
        }, LIST_PREVIEW_ENTER_MS);
      } else if (hoveredSlugRef.current !== item.slug) {
        updateListPreviewEntrySlug(null);
      }

      updateHoveredSlug(item.slug);
      return;
    }

    updateHoveredSlug(item.slug);
    applyTheme(item.accentColor ?? "#dedede");
  }

  const updateMobileScrollTheme = useCallback(() => {
    mobileScrollAnimationFrame.current = null;
    if (
      !isMobileViewportRef.current ||
      isMobileFilterOpen ||
      viewModeRef.current !== "grid" ||
      viewTransitionPhaseRef.current !== "idle"
    ) {
      return;
    }

    const cards = Array.from(cardElementsRef.current.entries());
    if (!cards.length) {
      clearThemeRef.current();
      return;
    }

    const viewportHeight = window.innerHeight;
    const activationY = viewportHeight * 0.56;
    const gridTop = Math.min(...cards.map(([, card]) => card.getBoundingClientRect().top));
    const gridBottom = Math.max(...cards.map(([, card]) => card.getBoundingClientRect().bottom));

    if (gridBottom < viewportHeight * 0.18 || gridTop > viewportHeight * 0.88) {
      if (hoveredSlugRef.current) clearThemeRef.current();
      return;
    }

    let nextSlug: string | null = null;
    let shortestDistance = Number.POSITIVE_INFINITY;

    for (const [slug, card] of cards) {
      const rect = card.getBoundingClientRect();
      const isVisible = rect.bottom > viewportHeight * 0.08 && rect.top < viewportHeight * 0.92;
      if (!isVisible) continue;

      const cardCenter = rect.top + rect.height / 2;
      const distance = Math.abs(cardCenter - activationY);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nextSlug = slug;
      }
    }

    if (!nextSlug || nextSlug === hoveredSlugRef.current) return;

    const nextItem = visibleItemsRef.current.find((item) => item.slug === nextSlug);
    if (!nextItem) return;

    handleCardEnterRef.current(nextItem);
  }, [isMobileFilterOpen]);

  const scheduleMobileScrollTheme = useCallback(() => {
    if (mobileScrollAnimationFrame.current) return;
    mobileScrollAnimationFrame.current = window.requestAnimationFrame(updateMobileScrollTheme);
  }, [updateMobileScrollTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    function handleViewportChange() {
      isMobileViewportRef.current = mediaQuery.matches;
      if (mediaQuery.matches) {
        scheduleMobileScrollTheme();
      } else {
        if (mobileScrollAnimationFrame.current) {
          window.cancelAnimationFrame(mobileScrollAnimationFrame.current);
          mobileScrollAnimationFrame.current = null;
        }
      }
    }

    handleViewportChange();
    window.addEventListener("scroll", scheduleMobileScrollTheme, { passive: true });
    window.addEventListener("resize", scheduleMobileScrollTheme);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", scheduleMobileScrollTheme);
      window.removeEventListener("resize", scheduleMobileScrollTheme);
      mediaQuery.removeEventListener("change", handleViewportChange);
      if (mobileScrollAnimationFrame.current) {
        window.cancelAnimationFrame(mobileScrollAnimationFrame.current);
        mobileScrollAnimationFrame.current = null;
      }
    };
  }, [scheduleMobileScrollTheme]);

  useEffect(() => {
    if (isMobileViewportRef.current) scheduleMobileScrollTheme();
  }, [filterKey, isMobileFilterOpen, scheduleMobileScrollTheme, viewMode]);

  useEffect(() => {
    clearThemeRef.current = clearTheme;
    handleCardEnterRef.current = handleCardEnter;
  });

  const nextViewMode: WorkJournalViewMode = viewMode === "grid" ? "list" : "grid";
  const buttonViewMode = isViewButtonPreviewed ? viewMode : nextViewMode;

  function renderFilterButtons(options: { closeOnSelect?: boolean } = {}) {
    return filters.map((filter) => {
      const isActive = activeFilters.includes(filter);

      return (
        <button
          key={filter}
          type="button"
          className={styles.filterButton}
          data-active={isActive}
          aria-pressed={isActive}
          onClick={() => {
            toggleFilter(filter);
            if (options.closeOnSelect) setIsMobileFilterOpen(false);
          }}
        >
          {filter}
        </button>
      );
    });
  }

  function renderViewToggleButton() {
    return (
      <button
        type="button"
        className={styles.viewButton}
        data-button-view={buttonViewMode}
        data-view={viewMode}
        aria-label={`Switch to ${nextViewMode} view`}
        onClick={handleViewToggleClick}
        onPointerEnter={handleViewToggleEnter}
        onPointerLeave={handleViewToggleLeave}
      >
        <span className={styles.viewButtonWindow} aria-hidden="true">
          <span className={styles.viewButtonTrack}>
            <span className={styles.viewButtonOption}>
              <span>List View</span>
              <ListIcon />
            </span>
            <span className={styles.viewButtonOption}>
              <span>Grid View</span>
              <GridIcon />
            </span>
          </span>
        </span>
      </button>
    );
  }

  return (
    <section className={styles.section} data-view={viewMode} aria-label="Work journal">
      <div className={styles.viewSwitcher} aria-label="Project view">
        {renderViewToggleButton()}
      </div>

      <div className={styles.mobileControls}>
        <h1 className={styles.mobileTitle}>All Work</h1>
        <div className={styles.mobileControlRow}>
          <button
            type="button"
            className={styles.mobileCategoryButton}
            aria-expanded={isMobileFilterOpen}
            aria-controls="work-mobile-filters"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FilterIcon />
            <span>Categories</span>
          </button>
          <div className={styles.mobileViewSwitcher} aria-label="Project view">
            {renderViewToggleButton()}
          </div>
        </div>
        <div className={styles.mobileControlDivider} aria-hidden="true" />
      </div>

      <div className={`${styles.filters} ${styles.desktopFilters}`} aria-label="Work filters">
        {renderFilterButtons()}
      </div>

      <div
        id="work-mobile-filters"
        className={styles.mobileFilterModal}
        data-open={isMobileFilterOpen}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMobileFilterOpen}
        aria-label="Work categories"
      >
        <div className={styles.mobileFilterModalBar}>
          <button type="button" className={styles.mobileCloseButton} onClick={() => setIsMobileFilterOpen(false)}>
            Close
          </button>
        </div>
        <div className={`${styles.filters} ${styles.mobileModalFilters}`} aria-label="Work filters">
          {renderFilterButtons({ closeOnSelect: true })}
        </div>
      </div>

      <div className={styles.filterDivider} aria-hidden="true" />
      <div className={styles.listHeader} aria-hidden={viewMode !== "list"}>
        <span>Industry</span>
        <span>Project Name</span>
        <span>Services</span>
        <span className={styles.listHeaderYear}>Year</span>
      </div>
      <div className={styles.themeOverlay} aria-hidden="true" />

      <div
        key={filterKey}
        className={styles.grid}
        data-count={visibleItems.length}
        data-filter-key={filterKey}
        data-hovering={hoveredSlug ? "true" : "false"}
        data-layout={layout}
        data-view-transitioned={hasCompletedViewTransition}
        data-transition={viewTransitionPhase}
        data-view={viewMode}
        onPointerLeave={clearTheme}
        onBlur={handleGridBlur}
      >
        {visibleItems.map((item, index) => (
          <a
            key={item.slug}
            ref={(node) => {
              if (node) {
                cardElementsRef.current.set(item.slug, node);
              } else {
                cardElementsRef.current.delete(item.slug);
              }
            }}
            className={styles.card}
            data-hovered={hoveredSlug === item.slug}
            data-list-preview-entry={listPreviewEntrySlug === item.slug}
            data-card-text-tone={cardTextTones[item.slug] ?? "dark"}
            data-primary-tag={item.tags[0] ?? "Work"}
            href={`/case-studies/${item.slug}`}
            style={{ "--index": index } as CSSProperties}
            onPointerEnter={() => handleCardEnter(item)}
            onPointerLeave={clearTheme}
            onFocus={() => handleCardEnter(item)}
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
            <span className={styles.listIndustry}>{item.industry}</span>
            <span className={styles.listService}>{item.tags[0] ?? "Work"}</span>
            <span className={styles.listYear}>{item.year}</span>
          </a>
        ))}
        {!visibleItems.length ? <p className={styles.empty}>No work matches the selected filters.</p> : null}
      </div>
    </section>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" className={styles.viewIcon} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 2.5H6.5V6.5H2.5V2.5Z" stroke="currentColor" strokeWidth="1.35" />
      <path d="M9.5 2.5H13.5V6.5H9.5V2.5Z" stroke="currentColor" strokeWidth="1.35" />
      <path d="M2.5 9.5H6.5V13.5H2.5V9.5Z" stroke="currentColor" strokeWidth="1.35" />
      <path d="M9.5 9.5H13.5V13.5H9.5V9.5Z" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" className={styles.viewIcon} viewBox="0 0 16 16" fill="none">
      <path d="M2 4H14" stroke="currentColor" strokeLinecap="square" strokeWidth="1.35" />
      <path d="M2 8H14" stroke="currentColor" strokeLinecap="square" strokeWidth="1.35" />
      <path d="M2 12H14" stroke="currentColor" strokeLinecap="square" strokeWidth="1.35" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className={styles.filterIcon} viewBox="0 0 18 18" fill="none">
      <path d="M2 4H16" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
      <path d="M2 9H12" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
      <path d="M2 14H8" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
    </svg>
  );
}
