"use client";

import { useIsPresentationTool } from "next-sanity/hooks";

export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool();

  if (isPresentationTool) {
    return null;
  }

  return (
    <a
      className="button-link"
      href="/api/draft-mode/disable"
      style={{
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: 50,
        minHeight: "2.8rem",
      }}
    >
      Disable Draft Mode
    </a>
  );
}
