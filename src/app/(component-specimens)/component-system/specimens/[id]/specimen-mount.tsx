"use client";

import { DialRoot, useDialKit } from "dialkit";
import { Fragment, useEffect, useState } from "react";
import {
  publicComponentRegistry,
  type PublicComponentId,
} from "@/components/component-system/registry";

type SurfaceValues = {
  canvasBackground?: string;
  canvasTheme?: string;
  viewport?: string;
};

type DialKitMessage = {
  type: "ripe:component-specimen-dialkit";
  id: PublicComponentId;
  enabled: boolean;
};

type VariantMessage = {
  type: "ripe:component-specimen-variant";
  id: PublicComponentId;
  variant: string;
};

export function SpecimenMount({ id }: Readonly<{ id: PublicComponentId }>) {
  const [isReady, setIsReady] = useState(false);
  const [isTuning, setIsTuning] = useState(false);
  const definition = publicComponentRegistry[id];
  const [selectedVariant, setSelectedVariant] = useState(definition.variants[0] ?? "default");
  const values = useDialKit(
    definition.name,
    definition.controls?.config ?? {},
    { id: `component-specimen-${id}` },
  );
  const surface = ((values as Record<string, unknown>).Surface ?? {}) as SurfaceValues;

  useEffect(() => {
    setIsReady(true);
    const search = new URLSearchParams(window.location.search);
    setIsTuning(search.get("dialkit") === "1");
    const requestedVariant = search.get("variant");
    if (requestedVariant && definition.variants.includes(requestedVariant)) {
      setSelectedVariant(requestedVariant);
    }

    const receiveDialKitState = (event: MessageEvent<DialKitMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "ripe:component-specimen-dialkit" ||
        event.data.id !== id
      ) return;

      setIsTuning(event.data.enabled);
    };

    window.addEventListener("message", receiveDialKitState);
    const receiveVariant = (event: MessageEvent<VariantMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "ripe:component-specimen-variant" ||
        event.data.id !== id ||
        !definition.variants.includes(event.data.variant)
      ) return;

      setSelectedVariant(event.data.variant);
    };
    window.addEventListener("message", receiveVariant);
    return () => {
      window.removeEventListener("message", receiveDialKitState);
      window.removeEventListener("message", receiveVariant);
    };
  }, [definition.variants, id]);

  useEffect(() => {
    const preventLinkNavigation = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("a[href]")) return;
      event.preventDefault();
    };

    const preventFormNavigation = (event: SubmitEvent) => {
      event.preventDefault();
    };

    document.addEventListener("click", preventLinkNavigation, true);
    document.addEventListener("auxclick", preventLinkNavigation, true);
    document.addEventListener("submit", preventFormNavigation, true);

    return () => {
      document.removeEventListener("click", preventLinkNavigation, true);
      document.removeEventListener("auxclick", preventLinkNavigation, true);
      document.removeEventListener("submit", preventFormNavigation, true);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let portalObserver: MutationObserver | undefined;
    let observedRoot: ShadowRoot | undefined;

    const hideDevelopmentIndicator = () => {
      const root = document.querySelector("nextjs-portal")?.shadowRoot;
      if (!root) return;

      if (root !== observedRoot) {
        portalObserver?.disconnect();
        observedRoot = root;
        portalObserver = new MutationObserver(hideDevelopmentIndicator);
        portalObserver.observe(root, { childList: true, subtree: true });
      }

      if (root.querySelector("[data-component-specimen-dev-indicator-style]")) return;

      const style = document.createElement("style");
      style.dataset.componentSpecimenDevIndicatorStyle = "";
      style.textContent = "#devtools-indicator { display: none !important; }";
      root.append(style);
    };

    const documentObserver = new MutationObserver(hideDevelopmentIndicator);
    documentObserver.observe(document.documentElement, { childList: true, subtree: true });
    hideDevelopmentIndicator();

    return () => {
      documentObserver.disconnect();
      portalObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const specimenSurface = document.querySelector<HTMLElement>("[data-component-specimen-page]");
    if (!specimenSurface) return;

    specimenSurface.style.background = surface.canvasBackground ?? "#faf9f7";
    specimenSurface.dataset.theme = (surface.canvasTheme ?? "Light").toLowerCase();
    specimenSurface.dataset.tone = surface.canvasTheme === "Dark" ? "light" : "dark";
    specimenSurface.dataset.selectedVariant = selectedVariant;
    document.documentElement.style.colorScheme = surface.canvasTheme === "Dark" ? "dark" : "light";

    window.parent.postMessage(
      {
        type: "ripe:component-specimen-surface",
        id,
        viewport: surface.viewport ?? "Full",
      },
      window.location.origin,
    );
  }, [id, selectedVariant, surface.canvasBackground, surface.canvasTheme, surface.viewport]);

  useEffect(() => {
    let animationFrame: number | null = null;
    let lastHeight = 0;

    const publishHeight = () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        const height = Math.ceil(Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        ));
        if (Math.abs(height - lastHeight) < 1) return;
        lastHeight = height;
        window.parent.postMessage(
          { type: "ripe:component-specimen-resize", id, height },
          window.location.origin,
        );
      });
    };

    const resizeObserver = new ResizeObserver(publishHeight);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver(publishHeight);
    mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });

    window.addEventListener("resize", publishHeight);
    window.addEventListener("load", publishHeight, true);
    void document.fonts.ready.then(publishHeight);
    publishHeight();

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", publishHeight);
      window.removeEventListener("load", publishHeight, true);
    };
  }, [id, isTuning, selectedVariant]);

  const specimen = definition.controls
    ? definition.controls.render(values, selectedVariant)
    : <definition.Specimen variant={selectedVariant} />;

  return (
    <>
      <Fragment key={selectedVariant}>{specimen}</Fragment>
      {isReady ? <span data-specimen-ready="" hidden /> : null}
      {isTuning ? <DialRoot defaultOpen productionEnabled /> : null}
    </>
  );
}
