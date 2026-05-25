"use client";

import { gsap } from "gsap";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NavLink } from "@/types/content";

type CaseStudiesIndexClientProps = {
  studies: CaseStudyListItem[];
  tags: string[];
  activeTag?: string;
  nav: NavLink[];
};

export type CaseStudyListItem = {
  title: string;
  slug: string;
  summary: string;
  year?: string;
  tags: string[];
  accentColor?: string;
  coverMedia: {
    kind: "image" | "video";
    src: string;
    alt: string;
    poster?: string;
  };
};

const videoExtensions = [".mp4", ".webm", ".mov", ".m4v", ".m3u8", ".ogv", ".ogg"];

function toTagSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isVideoStudy(study: CaseStudyListItem) {
  if (study.coverMedia.kind === "video") return true;
  const src = study.coverMedia.src.toLowerCase();
  if (src.startsWith("data:video/")) return true;
  return videoExtensions.some((ext) => src.includes(ext));
}

function LazyVideo({
  className,
  src,
  poster,
  forceLoad = false,
}: {
  className: string;
  src: string;
  poster?: string;
  forceLoad?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(forceLoad);
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    if (forceLoad) setShouldLoad(true);
  }, [forceLoad]);

  useEffect(() => {
    if (shouldLoad) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      {
        rootMargin: "360px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div
      ref={wrapperRef}
      className="ripe-video-shell"
      data-video-ready={hasFrame || poster ? "true" : "false"}
      data-video-loaded={shouldLoad ? "true" : "false"}
    >
      <video
        className={`${className} ripe-video-el`}
        src={shouldLoad ? src : undefined}
        autoPlay
        loop
        muted
        playsInline
        preload={shouldLoad ? "metadata" : "none"}
        poster={poster}
        onLoadedMetadata={() => setHasFrame(true)}
        onLoadedData={() => setHasFrame(true)}
        onCanPlay={() => setHasFrame(true)}
        onPlay={() => setHasFrame(true)}
        onError={() => setHasFrame(true)}
      />
    </div>
  );
}

function toRgb(hex: string) {
  const normalized = hex.trim();
  const value = normalized.startsWith("#") ? normalized.slice(1) : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const srgb = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function GridMedia({ study }: { study: CaseStudyListItem }) {
  if (isVideoStudy(study)) {
    return (
      <LazyVideo className="casestudy_coverimage" src={study.coverMedia.src} poster={study.coverMedia.poster} />
    );
  }

  return (
    <img
      className="casestudy_coverimage"
      src={study.coverMedia.src}
      alt={study.coverMedia.alt || study.title}
      loading="lazy"
      decoding="async"
    />
  );
}

function FollowerVisual({ study, forceLoad = false }: { study: CaseStudyListItem; forceLoad?: boolean }) {
  if (isVideoStudy(study)) {
    return (
      <LazyVideo
        className="preview-item__visual-img"
        src={study.coverMedia.src}
        poster={study.coverMedia.poster}
        forceLoad={forceLoad}
      />
    );
  }

  return (
    <img
      className="preview-item__visual-img"
      src={study.coverMedia.src}
      alt={study.coverMedia.alt || study.title}
      loading="lazy"
      decoding="async"
    />
  );
}

export function CaseStudiesIndexClient({ studies, tags, activeTag, nav }: CaseStudiesIndexClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const listWrapperRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  const followerInnerRef = useRef<HTMLDivElement | null>(null);
  const followerCollectionRef = useRef<HTMLDivElement | null>(null);
  const isInitialViewRenderRef = useRef(true);
  const [loadedFollowerSlugs, setLoadedFollowerSlugs] = useState<Set<string>>(() => new Set());

  const primeFollowerVideo = useCallback((slug: string) => {
    setLoadedFollowerSlugs((current) => {
      if (current.has(slug)) return current;
      const next = new Set(current);
      next.add(slug);
      return next;
    });
  }, []);

  const mobileLabel = useMemo(() => {
    return activeTag ? activeTag.toUpperCase() : "CATEGORIES";
  }, [activeTag]);

  useEffect(() => {
    document.body.classList.toggle("mobile-filters-open", mobileFiltersOpen);
    return () => {
      document.body.classList.remove("mobile-filters-open");
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const grid = gridRef.current;
    const listContainer = listContainerRef.current;
    const listWrapper = listWrapperRef.current;
    if (!grid || !listContainer || !listWrapper) return;

    const showGrid = () => {
      grid.style.display = "";
      listContainer.classList.add("is-hidden");
      listWrapper.style.display = "none";
    };

    const showList = () => {
      grid.style.display = "none";
      listContainer.classList.remove("is-hidden");
      listWrapper.style.display = "block";
    };

    if (isInitialViewRenderRef.current) {
      isInitialViewRenderRef.current = false;
      if (viewMode === "grid") {
        showGrid();
      } else {
        showList();
      }
      return;
    }

    if (viewMode === "list") {
      gsap.to(grid, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          grid.style.display = "none";
          listContainer.classList.remove("is-hidden");
          listWrapper.style.display = "block";
          gsap.fromTo([listContainer, listWrapper], { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: "opacity" });
        },
      });
      return;
    }

    gsap.to([listContainer, listWrapper], {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        listContainer.classList.add("is-hidden");
        listWrapper.style.display = "none";
        grid.style.display = "";
        gsap.fromTo(grid, { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: "opacity" });
      },
    });
  }, [viewMode]);

  useEffect(() => {
    const follower = followerRef.current;
    const followerInner = followerInnerRef.current;
    const collection = followerCollectionRef.current;

    if (!follower || !followerInner || !collection || viewMode !== "list") {
      return;
    }

    if (window.matchMedia("(max-width: 991px)").matches) {
      return;
    }

    const items = Array.from(collection.querySelectorAll<HTMLElement>("[data-follower-item]"));
    if (!items.length) return;

    let previousIndex: number | null = null;
    let firstEntry = true;

    const offset = 100;
    const duration = 0.5;

    gsap.set(follower, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(follower, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(follower, "y", { duration: 0.6, ease: "power3" });

    const onMouseMove = (event: MouseEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);

    const cleanupVisuals = () => {
      const visuals = Array.from(follower.querySelectorAll<HTMLElement>("[data-follower-visual]"));
      for (const visual of visuals) {
        gsap.killTweensOf(visual);
        gsap.delayedCall(duration, () => visual.remove());
      }
      firstEntry = true;
      previousIndex = null;
    };

    const teardown: Array<() => void> = [];

    items.forEach((item, index) => {
      const onEnter = () => {
        const forward = previousIndex === null || index > previousIndex;
        previousIndex = index;

        const existingVisuals = Array.from(follower.querySelectorAll<HTMLElement>("[data-follower-visual]"));
        for (const visual of existingVisuals) {
          gsap.killTweensOf(visual);
          gsap.to(visual, {
            yPercent: forward ? -offset : offset,
            duration,
            ease: "power2.inOut",
            overwrite: "auto",
            onComplete: () => visual.remove(),
          });
        }

        const visual = item.querySelector<HTMLElement>("[data-follower-visual]");
        if (!visual) return;

        const clone = visual.cloneNode(true) as HTMLElement;
        followerInner.appendChild(clone);

        if (!firstEntry) {
          gsap.fromTo(
            clone,
            { yPercent: forward ? offset : -offset },
            { yPercent: 0, duration, ease: "power2.inOut", overwrite: "auto" },
          );
        } else {
          firstEntry = false;
        }
      };

      const onLeave = () => {
        const current = follower.querySelector<HTMLElement>("[data-follower-visual]");
        if (!current) return;
        gsap.killTweensOf(current);
        gsap.to(current, {
          yPercent: -offset,
          duration,
          ease: "power2.inOut",
          overwrite: "auto",
          onComplete: () => current.remove(),
        });
      };

      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);

      teardown.push(() => {
        item.removeEventListener("mouseenter", onEnter);
        item.removeEventListener("mouseleave", onLeave);
      });
    });

    collection.addEventListener("mouseleave", cleanupVisuals);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      collection.removeEventListener("mouseleave", cleanupVisuals);
      teardown.forEach((fn) => fn());
      cleanupVisuals();
    };
  }, [viewMode, studies]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const grid = gridRef.current;
    if (!grid || mq.matches || viewMode !== "grid") return;

    const body = document.body;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".masonry-item"));
    if (!cards.length) return;

    let fadeTimer: number | null = null;

    let overlay = document.getElementById("hover-theme-overlay") as HTMLDivElement | null;
    let createdOverlay = false;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "hover-theme-overlay";
      body.insertBefore(overlay, body.firstChild);
      createdOverlay = true;
    }

    const clearTheme = () => {
      cards.forEach((card) => card.classList.remove("is-hovered"));
      body.classList.remove("theme-active");
      body.classList.add("theme-fading");

      if (fadeTimer) window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => {
        body.classList.remove("theme-fading");
        body.style.removeProperty("--theme-bg");
        fadeTimer = null;
      }, 450);
    };

    const activateTheme = (card: HTMLElement) => {
      cards.forEach((entry) => entry.classList.remove("is-hovered"));
      card.classList.add("is-hovered");

      const accent = card.getAttribute("data-color") || "#d8d1ce";
      body.style.setProperty("--theme-bg", accent);
      body.classList.add("theme-active", "theme-active-ready");
      body.classList.remove("theme-fading");

      const select = document.querySelector<HTMLSelectElement>(".grid-toggle");
      if (select) {
        const rgb = toRgb(accent);
        if (rgb) {
          select.classList.toggle("is-inverted", luminance(rgb) < 0.45);
        }
      }
    };

    const removeListeners: Array<() => void> = [];

    cards.forEach((card) => {
      const hotspot = card;

      const onEnter = () => activateTheme(card);
      const onLeave = () => clearTheme();

      hotspot.addEventListener("mouseenter", onEnter);
      hotspot.addEventListener("mouseleave", onLeave);

      removeListeners.push(() => {
        hotspot.removeEventListener("mouseenter", onEnter);
        hotspot.removeEventListener("mouseleave", onLeave);
      });
    });

    const onWindowBlur = () => clearTheme();
    window.addEventListener("blur", onWindowBlur);

    return () => {
      if (fadeTimer) window.clearTimeout(fadeTimer);
      removeListeners.forEach((fn) => fn());
      window.removeEventListener("blur", onWindowBlur);
      body.classList.remove("theme-active", "theme-fading", "theme-active-ready");
      body.style.removeProperty("--theme-bg");
      const select = document.querySelector<HTMLSelectElement>(".grid-toggle");
      if (select) {
        select.classList.remove("is-inverted");
      }
      if (createdOverlay && overlay?.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
  }, [viewMode, studies]);

  return (
    <section className="main case-studies-native-root">
      <nav data-nav-bar-height="" className="nav_wrap">
        <nav className="nav_contain u-container">
          <Link aria-label="Go to homepage" href="/" className="nav_logo w-inline-block">
            Ripe
          </Link>
          <div className="case-studies-native-nav-links">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="nav_menu_link">
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </nav>
      <section className="section">
        <section className="filters section u-padding-v-64">
          <div className="grid-switch">
            <div className="grid-form w-form">
              <form className="filters-and-sort" onSubmit={(event) => event.preventDefault()}>
                <button className="mobile-categories-btn" type="button" onClick={() => setMobileFiltersOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <span className="mobile-categories-label">{mobileLabel}</span>
                </button>
                <select
                  id="grid-toggle"
                  name="grid-toggle"
                  className="grid-toggle w-select"
                  value={viewMode === "grid" ? "Grid" : "List"}
                  onChange={(event) => setViewMode(event.target.value === "List" ? "list" : "grid")}
                >
                  <option value="Grid">Grid</option>
                  <option value="List">List</option>
                </select>
              </form>
            </div>
          </div>
          <div className={`form-block w-form ${mobileFiltersOpen ? "is-open" : ""}`}>
            <button
              className="mobile-filter-close"
              type="button"
              aria-label="Close filters"
              onClick={() => setMobileFiltersOpen(false)}
            >
              &times;
            </button>
            <div className="collection-list-wrapper-3 w-dyn-list">
              <div role="list" className="filter-list w-dyn-items">
                <div role="listitem" className="w-dyn-item">
                  <Link href="/case-studies" className={`w-checkbox filter-checkbox ${!activeTag ? "is-active" : ""}`} onClick={() => setMobileFiltersOpen(false)}>
                    <span className="checkbox-label w-form-label">All</span>
                  </Link>
                </div>
                {tags.map((tag) => (
                  <div role="listitem" className="w-dyn-item" key={tag}>
                    <Link
                      href={`/case-studies/tags/${toTagSlug(tag)}`}
                      className={`w-checkbox filter-checkbox ${activeTag === tag ? "is-active" : ""}`}
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <span className="checkbox-label w-form-label">{tag}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className="horizontal-rule u-margin-h-24" />
      </section>

      <div data-follower-wrap="" ref={listContainerRef} className={`preview-container ${viewMode === "list" ? "" : "is-hidden"}`}>
        <div className="preview-item__row tablet--hide">
          <div className="preview-item__col is--large">
            <span className="preview-container__label">Name</span>
          </div>
          <div className="preview-item__col is--medium">
            <span className="preview-container__label">Description</span>
          </div>
          <div className="preview-item__col is--small is-right">
            <span className="preview-container__label is-right">Year</span>
          </div>
        </div>
        <div data-follower-collection="" className="cases_listview-wrapper w-dyn-list" ref={followerCollectionRef}>
          <div role="list" className="cases_list-view-list w-dyn-items" ref={listWrapperRef}>
            {studies.map((study) => (
              <div data-follower-item="" role="listitem" className="cases-list-view-row w-dyn-item preview-item" key={study.slug}>
                <Link
                  href={`/case-studies/${study.slug}`}
                  className="preview-item__inner w-inline-block"
                  onPointerEnter={() => primeFollowerVideo(study.slug)}
                  onFocus={() => primeFollowerVideo(study.slug)}
                >
                  <div className="preview-item__row tablet--hide">
                    <div className="preview-item__col is--large">
                      <h2 className="casestudy_title-text">{study.title}</h2>
                    </div>
                    <div className="preview-item__col is--medium tablet--hide">
                      <p className="casestudy_description">{study.summary}</p>
                    </div>
                    <div className="preview-item__col is--small">
                      <p className="casestudy_year is-right">{study.year || ""}</p>
                    </div>
                  </div>
                  <div data-follower-visual="" className="preview-item__visual">
                    <FollowerVisual study={study} forceLoad={loadedFollowerSlugs.has(study.slug)} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div data-follower-cursor="" className="preview-follower" ref={followerRef}>
            <div data-follower-cursor-inner="" className="preview-follower__inner" ref={followerInnerRef}>
              <div className="preview-follower__label">
                <div className="preview-follower__label-span">View case</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-fs-list-element="list"
        className={`case-studies-wrapper is-grid w-dyn-list ${viewMode === "grid" ? "" : "is-hidden"}`}
        ref={gridRef}
      >
        <div id="masonry1" data-fs-list-element="list" role="list" className="case-studies-list w-dyn-items">
          {studies.map((study, index) => (
            <div
              data-fs-cmsfilter-element="item"
              data-color={study.accentColor || "#d8d1ce"}
              role="listitem"
              className="masonry-item w-dyn-item collection-item-2"
              key={study.slug}
            >
              <div style={{ backgroundColor: study.accentColor || "#d8d1ce" }} className="color_overlay" />
              <div className="large-card-description">{study.summary}</div>
              <div className="feed_card-wrap">
                <div className="feed_card-bg">
                  <div data-fs-list-nest="tags" className="tags-wrap u-flex-vertical" />
                  <Link href={`/case-studies/${study.slug}`} data-fs-list-element="nest-link" className="case_study-tag" aria-label={`Open ${study.title}`}>
                    {" "}
                  </Link>
                </div>
                <div className="w-layout-vflex img-wrap">
                  <GridMedia study={study} />
                </div>
                <div className="content-wrap u-flex-vertical">
                  <div className="casestudy_title-text">{study.title}</div>
                  <div className={`casestudy_description ${study.summary ? "" : "w-dyn-bind-empty"}`}>{study.summary}</div>
                </div>
                <div className="collection-list-wrapper-7">
                  {study.tags.slice(0, index % 9 === 8 ? 2 : 1).map((tag) => (
                    <Link key={tag} href={`/case-studies/tags/${toTagSlug(tag)}`} className="link">
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
