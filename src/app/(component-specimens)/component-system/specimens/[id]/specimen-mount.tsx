"use client";

import { DialRoot, useDialKit } from "dialkit";
import { useEffect, useState } from "react";
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

export function SpecimenMount({ id }: Readonly<{ id: PublicComponentId }>) {
  const [isReady, setIsReady] = useState(false);
  const [isTuning, setIsTuning] = useState(false);
  const definition = publicComponentRegistry[id];
  const values = useDialKit(
    definition.name,
    definition.controls?.config ?? {},
    { id: `component-specimen-${id}` },
  );
  const surface = ((values as Record<string, unknown>).Surface ?? {}) as SurfaceValues;

  useEffect(() => {
    setIsReady(true);
    setIsTuning(new URLSearchParams(window.location.search).get("dialkit") === "1");

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
    return () => window.removeEventListener("message", receiveDialKitState);
  }, [id]);

  useEffect(() => {
    const specimenSurface = document.querySelector<HTMLElement>("[data-component-specimen-page]");
    if (!specimenSurface) return;

    specimenSurface.style.background = surface.canvasBackground ?? "#ffffff";
    specimenSurface.dataset.theme = (surface.canvasTheme ?? "Light").toLowerCase();
    specimenSurface.dataset.tone = surface.canvasTheme === "Dark" ? "light" : "dark";
    document.documentElement.style.colorScheme = surface.canvasTheme === "Dark" ? "dark" : "light";

    window.parent.postMessage(
      {
        type: "ripe:component-specimen-surface",
        id,
        viewport: surface.viewport ?? "Full",
      },
      window.location.origin,
    );
  }, [id, surface.canvasBackground, surface.canvasTheme, surface.viewport]);

  const specimen = definition.controls
    ? definition.controls.render(values)
    : <definition.Specimen />;

  return (
    <>
      {specimen}
      {isReady ? <span data-specimen-ready="" hidden /> : null}
      {isTuning ? <DialRoot defaultOpen productionEnabled /> : null}
    </>
  );
}
