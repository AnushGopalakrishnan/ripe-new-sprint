"use client";

import { useEffect, useRef } from "react";

type RipeShellRuntimeProps = {
  bodyAttributes?: Record<string, string>;
  navMarkup: string;
};

function applyBodyAttributes(attributes: Record<string, string>) {
  const body = document.body;
  const classNames = (attributes.class ?? "").split(/\s+/).filter(Boolean);
  const previousAttributes = new Map<string, string | null>();

  for (const className of classNames) {
    body.classList.add(className);
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (name === "class" || name.startsWith("data-wf-")) continue;
    previousAttributes.set(name, body.getAttribute(name));
    body.setAttribute(name, value);
  }

  return () => {
    for (const className of classNames) {
      body.classList.remove(className);
    }

    for (const [name, previousValue] of previousAttributes) {
      if (previousValue === null) {
        body.removeAttribute(name);
      } else {
        body.setAttribute(name, previousValue);
      }
    }
  };
}

export function RipeShellRuntime({ bodyAttributes = {}, navMarkup }: RipeShellRuntimeProps) {
  const navRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => applyBodyAttributes(bodyAttributes), [bodyAttributes]);

  useEffect(() => {
    const navRoot = navRootRef.current;
    const nav = navRoot?.querySelector<HTMLElement>(".nav_wrap");
    const checkbox = navRoot?.querySelector<HTMLInputElement>(".nav_checkbox");
    if (!nav || !checkbox) return;

    let lastScrollY = window.scrollY;
    let scrollPosition = 0;
    const threshold = 80;

    const unlockBody = () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };

    const onCheckboxChange = () => {
      if (checkbox.checked) {
        scrollPosition = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = "100%";
        nav.classList.remove("is-hidden");
      } else {
        unlockBody();
        window.scrollTo(0, scrollPosition);
        lastScrollY = scrollPosition;
      }
    };

    const onScroll = () => {
      if (checkbox.checked) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > threshold) {
        nav.classList.add("is-hidden");
      } else {
        nav.classList.remove("is-hidden");
      }
      lastScrollY = currentScrollY;
    };

    checkbox.addEventListener("change", onCheckboxChange);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      checkbox.removeEventListener("change", onCheckboxChange);
      window.removeEventListener("scroll", onScroll);
      nav.classList.remove("is-hidden");
      if (checkbox.checked) {
        checkbox.checked = false;
        unlockBody();
      }
    };
  }, []);

  return <div ref={navRootRef} style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: navMarkup }} />;
}
