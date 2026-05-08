"use client";

import { useEffect } from "react";
import { bridgeScript } from "@/lib/editor/bridge-source";

type NativeRouteRuntimeProps = {
  bodyAttributes: Record<string, string>;
  htmlAttributes: Record<string, string>;
  sourceRoute: string;
};

declare global {
  interface Window {
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

function applyAttributes(element: HTMLElement, attributes: Record<string, string>) {
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
    element.setAttribute(name, value);
  }
}

function escapeInlineJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function createAttributeBootstrapScript(
  bodyAttributes: Record<string, string>,
  htmlAttributes: Record<string, string>,
  sourceRoute: string,
) {
  return `(function(){var body=${escapeInlineJson(bodyAttributes)};var html=${escapeInlineJson(
    htmlAttributes,
  )};window.__RIPE_NATIVE_SOURCE_ROUTE__=${escapeInlineJson(
    sourceRoute,
  )};function apply(el,attrs){if(!el)return;if(Object.prototype.hasOwnProperty.call(attrs,"class")){el.className=attrs["class"]||"";}for(var k in attrs){if(k==="class")continue;el.setAttribute(k,attrs[k]);}}apply(document.documentElement,html);apply(document.body,body);})();`;
}

async function executeNativeScripts() {
  const scripts = Array.from(
    document.querySelectorAll<HTMLTemplateElement>("template[data-ripe-native-script]"),
  );

  for (const original of scripts) {
    if (original.dataset.ripeNativeExecuted === "true") continue;
    original.dataset.ripeNativeExecuted = "true";

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
      original.remove();

      if (!script.src) resolve();
    });
  }
}

export function NativeRouteRuntime({
  bodyAttributes,
  htmlAttributes,
  sourceRoute,
}: NativeRouteRuntimeProps) {
  useEffect(() => {
    window.__RIPE_NATIVE_SOURCE_ROUTE__ = sourceRoute;

    applyAttributes(document.documentElement, htmlAttributes);
    applyAttributes(document.body, bodyAttributes);
    void executeNativeScripts();

    if (
      new URLSearchParams(window.location.search).get("__editor") === "1" &&
      !(window as Window & { __RIPE_EDITOR_BRIDGE__?: boolean }).__RIPE_EDITOR_BRIDGE__
    ) {
      const script = document.createElement("script");
      script.dataset.ripeEditorBridge = "true";
      script.text = bridgeScript;
      document.body.appendChild(script);
    }
  }, [bodyAttributes, htmlAttributes, sourceRoute]);

  return (
    <script
      data-ripe-native-attribute-bootstrap=""
      dangerouslySetInnerHTML={{
        __html: createAttributeBootstrapScript(bodyAttributes, htmlAttributes, sourceRoute),
      }}
    />
  );
}
