"use client";

import { gsap } from "gsap";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const shutterAmount = 10;
const transitionDuration = 0.5;
const shutterStaggerAmount = 0.3;

const transitionTestRoutes = {
  home: "/home-new-feed",
  work: "/work-new-alternate?view=grid",
};

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function getInternalHref(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function currentPageContainer() {
  return document.querySelector<HTMLElement>("[data-page-transition-container]");
}

function pageMotionTargets() {
  const container = currentPageContainer();
  if (!container) return [];

  return Array.from(container.children).filter((element): element is HTMLElement => {
    if (!(element instanceof HTMLElement)) return false;
    if (["LINK", "SCRIPT", "STYLE", "TEMPLATE"].includes(element.tagName)) return false;
    if (element.matches("nav, .nav_wrap, .nav_contain")) return false;
    return true;
  });
}

export function PageTransitionController() {
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const isFirstRouteRef = useRef(true);
  const isNavigatingRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const stopTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);

  const shutters = useCallback(() => {
    return panelRef.current?.querySelectorAll<HTMLElement>("[data-transition-shutter]") ?? [];
  }, []);

  const resetTransition = useCallback(() => {
    const panel = panelRef.current;
    const allShutters = shutters();
    if (!panel || !allShutters.length) return;

    gsap.set(panel, { opacity: 0, pointerEvents: "none" });
    gsap.set(allShutters, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      scaleY: 1.02,
      yPercent: 50,
    });
  }, [shutters]);

  const runLeaveAnimation = useCallback(() => {
    const panel = panelRef.current;
    const allShutters = shutters();
    const current = pageMotionTargets();

    stopTimeline();

    const tl = gsap.timeline();
    timelineRef.current = tl;

    if (prefersReducedMotion() || !panel || !allShutters.length) {
      if (current.length) tl.set(current, { autoAlpha: 0 });
      return tl;
    }

    tl.set(panel, { opacity: 1, pointerEvents: "none" }, 0);
    tl.set(allShutters, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      scaleY: 1.02,
      yPercent: 50,
    }, 0);

    tl.to(allShutters, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: transitionDuration,
      ease: "power3.in",
      stagger: {
        amount: shutterStaggerAmount,
        from: "end",
      },
      yPercent: 0,
    }, 0);

    if (current.length) {
      tl.fromTo(current, { y: "0vh" }, {
        duration: transitionDuration * 1.5,
        ease: "power3.in",
        y: "-15vh",
      }, 0);
    }

    return tl;
  }, [shutters, stopTimeline]);

  const runEnterAnimation = useCallback(() => {
    const panel = panelRef.current;
    const allShutters = shutters();
    const next = pageMotionTargets();

    stopTimeline();

    const tl = gsap.timeline({
      onComplete: () => {
        if (next.length) gsap.set(next, { clearProps: "opacity,visibility,transform" });
        resetTransition();
      },
    });
    timelineRef.current = tl;

    if (prefersReducedMotion() || !panel || !allShutters.length) {
      if (next.length) tl.set(next, { autoAlpha: 1, clearProps: "transform" });
      tl.call(resetTransition);
      return tl;
    }

    const totalCoverDuration = transitionDuration + shutterStaggerAmount;

    tl.set(panel, { opacity: 1, pointerEvents: "none" }, 0);
    tl.set(allShutters, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      scaleY: 1.02,
      yPercent: 0,
    }, 0);

    if (next.length) {
      tl.fromTo(next, { autoAlpha: 1, y: "20vh" }, {
        duration: totalCoverDuration,
        ease: "expo.out",
        y: "0vh",
      }, 0);
    }

    tl.to(allShutters, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% -2%, 0% -2%)",
      duration: transitionDuration * 1.5,
      ease: "expo.out",
      stagger: {
        amount: shutterStaggerAmount,
        from: "end",
      },
      overwrite: "auto",
      yPercent: -50,
    }, 0);

    return tl;
  }, [resetTransition, shutters, stopTimeline]);

  const navigateWithTransition = useCallback(
    (href: string) => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      const tl = runLeaveAnimation();
      tl.eventCallback("onComplete", () => {
        router.push(href as Route);
      });
    },
    [router, runLeaveAnimation],
  );

  useEffect(() => {
    resetTransition();
    return stopTimeline;
  }, [resetTransition, stopTimeline]);

  useEffect(() => {
    if (isFirstRouteRef.current) {
      isFirstRouteRef.current = false;
      isNavigatingRef.current = false;
      resetTransition();
      return;
    }

    isNavigatingRef.current = false;
    window.scrollTo(0, 0);
    runEnterAnimation();
  }, [pathname, resetTransition, runEnterAnimation]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (isModifiedClick(event) || event.defaultPrevented) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = getInternalHref(anchor);
      if (!href) return;

      event.preventDefault();
      navigateWithTransition(href);
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;
      if (!event.shiftKey || event.key.toLowerCase() !== "h") return;

      event.preventDefault();
      const nextRoute = pathname.startsWith("/work-new") ? transitionTestRoutes.home : transitionTestRoutes.work;
      navigateWithTransition(nextRoute);
    }

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigateWithTransition, pathname]);

  return (
    <div data-transition-wrap className="transition" aria-hidden="true">
      <div data-transition-panel className="transition__panel" ref={panelRef}>
        {Array.from({ length: shutterAmount }, (_, index) => (
          <div data-transition-shutter className="transition__shutter" key={index} />
        ))}
      </div>
    </div>
  );
}
