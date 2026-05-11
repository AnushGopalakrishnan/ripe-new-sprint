"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const transitionClass = "ripe-page-entering";

export function PageTransitionController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(transitionClass);
    void root.offsetWidth;
    root.classList.add(transitionClass);

    const timeout = window.setTimeout(() => {
      root.classList.remove(transitionClass);
    }, 440);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return null;
}
