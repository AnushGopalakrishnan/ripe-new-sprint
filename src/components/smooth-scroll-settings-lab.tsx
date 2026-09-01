"use client";

import { DialRoot, useDialKit } from "dialkit";
import { useEffect, useState } from "react";
import {
  SMOOTH_SCROLL_SETTINGS_EVENT,
  type SmoothScrollSettings,
} from "@/components/smooth-scroll-provider";

function publish(settings: SmoothScrollSettings) {
  window.dispatchEvent(
    new CustomEvent<SmoothScrollSettings>(SMOOTH_SCROLL_SETTINGS_EVENT, { detail: settings }),
  );
}

export function SmoothScrollSettingsLab() {
  const [isAvailable, setIsAvailable] = useState(false);
  const settings = useDialKit(
    "Lenis smooth scroll",
    {
      enabled: true,
      lerp: [0.075, 0.01, 0.2, 0.005],
      wheelMultiplier: [0.82, 0.25, 2, 0.05],
      touchMultiplier: [1, 0.25, 3, 0.05],
      smoothWheel: true,
      syncTouch: false,
      touch: {
        syncTouchLerp: [0.075, 0.01, 0.2, 0.005],
        touchInertiaExponent: [1.7, 1, 3, 0.05],
      },
    },
    { id: "ripe-lenis-settings" },
  );

  useEffect(() => {
    setIsAvailable(new URLSearchParams(window.location.search).get("lenis-lab") === "1");
  }, []);

  useEffect(() => {
    if (!isAvailable) return;

    publish({
      enabled: settings.enabled,
      lerp: settings.lerp,
      smoothWheel: settings.smoothWheel,
      syncTouch: settings.syncTouch,
      syncTouchLerp: settings.touch.syncTouchLerp,
      touchInertiaExponent: settings.touch.touchInertiaExponent,
      touchMultiplier: settings.touchMultiplier,
      wheelMultiplier: settings.wheelMultiplier,
    });
  }, [
    isAvailable,
    settings.enabled,
    settings.lerp,
    settings.smoothWheel,
    settings.syncTouch,
    settings.touch.syncTouchLerp,
    settings.touch.touchInertiaExponent,
    settings.touchMultiplier,
    settings.wheelMultiplier,
  ]);

  return isAvailable ? <DialRoot productionEnabled /> : null;
}
