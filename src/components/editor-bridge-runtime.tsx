"use client";

import { useEffect } from "react";
import { bridgeScript } from "@/lib/editor/bridge-source";

export function EditorBridgeRuntime() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("__editor") !== "1") return;

    const editorWindow = window as Window & { __RIPE_EDITOR_BRIDGE__?: boolean };
    if (editorWindow.__RIPE_EDITOR_BRIDGE__) return;

    const script = document.createElement("script");
    script.dataset.ripeEditorBridge = "true";
    script.text = bridgeScript;
    document.body.appendChild(script);
  }, []);

  return null;
}
