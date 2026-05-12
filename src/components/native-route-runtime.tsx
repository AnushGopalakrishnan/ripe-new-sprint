"use client";

import { useEffect } from "react";
import { bridgeScript } from "@/lib/editor/bridge-source";

type NativeRouteRuntimeProps = {
  bodyAttributes: Record<string, string>;
  executeScripts?: boolean;
  htmlAttributes: Record<string, string>;
  sourceRoute: string;
  webflowRuntime?: boolean;
};

declare global {
  interface Window {
    __RIPE_EXECUTED_NATIVE_SCRIPT_SRCS__?: Set<string>;
    __RIPE_NATIVE_SOURCE_ROUTE__?: string;
  }
}

const managedHtmlAttributes = [
  "data-wf-domain",
  "data-wf-page",
  "data-wf-site",
  "data-wf-status",
  "data-wf-collection",
  "data-wf-item-slug",
  "lang",
];

function stripWebflowRuntimeClasses(element: HTMLElement) {
  element.className = element.className
    .split(/\s+/)
    .filter((className) => className && !className.startsWith("w-mod-") && !className.startsWith("wf-"))
    .join(" ");
}

function applyAttributes(element: HTMLElement, attributes: Record<string, string>, webflowRuntime: boolean) {
  for (const name of Array.from(element.attributes).map((attribute) => attribute.name)) {
    if (name === "class") continue;
    if (!(name in attributes) && (name.startsWith("data-wf-") || managedHtmlAttributes.includes(name))) {
      element.removeAttribute(name);
    }
  }

  if ("class" in attributes) {
    element.className = attributes.class;
  } else if (element === document.body) {
    element.removeAttribute("class");
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (name === "class") continue;
    if (!webflowRuntime && name.startsWith("data-wf-")) continue;
    element.setAttribute(name, value);
  }

  if (!webflowRuntime && element === document.documentElement) {
    stripWebflowRuntimeClasses(element);
  }
}

async function executeNativeScripts() {
  const scripts = Array.from(
    document.querySelectorAll<HTMLTemplateElement>("template[data-ripe-native-script]"),
  );

  for (const original of scripts) {
    if (original.dataset.ripeNativeExecuted === "true") continue;
    original.dataset.ripeNativeExecuted = "true";

    const src = original.getAttribute("src");
    const resolvedSrc = src ? new URL(src, window.location.href).href : "";

    if (resolvedSrc) {
      window.__RIPE_EXECUTED_NATIVE_SCRIPT_SRCS__ ??= new Set<string>();
      if (window.__RIPE_EXECUTED_NATIVE_SCRIPT_SRCS__.has(resolvedSrc)) continue;
      window.__RIPE_EXECUTED_NATIVE_SCRIPT_SRCS__.add(resolvedSrc);
    }

    await new Promise<void>((resolve) => {
      const script = document.createElement("script");

      for (const attribute of Array.from(original.attributes)) {
        if (attribute.name === "data-ripe-native-script") continue;
        if (attribute.name === "data-ripe-native-executed") continue;
        script.setAttribute(attribute.name, attribute.value);
      }

      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => resolve();

      if (!script.src) {
        const encodedContent = original.dataset.ripeNativeScriptContent;
        script.text = encodedContent ? window.atob(encodedContent) : original.textContent ?? "";
      }

      original.after(script);

      if (!script.src) resolve();
    });
  }
}

export function NativeRouteRuntime({
  bodyAttributes,
  executeScripts = true,
  htmlAttributes,
  sourceRoute,
  webflowRuntime = true,
}: NativeRouteRuntimeProps) {
  useEffect(() => {
    window.__RIPE_NATIVE_SOURCE_ROUTE__ = sourceRoute;

    applyAttributes(document.documentElement, htmlAttributes, webflowRuntime);
    applyAttributes(document.body, bodyAttributes, webflowRuntime);
    if (executeScripts) void executeNativeScripts();

    if (
      new URLSearchParams(window.location.search).get("__editor") === "1" &&
      !(window as Window & { __RIPE_EDITOR_BRIDGE__?: boolean }).__RIPE_EDITOR_BRIDGE__
    ) {
      const script = document.createElement("script");
      script.dataset.ripeEditorBridge = "true";
      script.text = bridgeScript;
      document.body.appendChild(script);
    }
  }, [bodyAttributes, executeScripts, htmlAttributes, sourceRoute, webflowRuntime]);

  return <template data-ripe-native-attribute-bootstrap="" />;
}
