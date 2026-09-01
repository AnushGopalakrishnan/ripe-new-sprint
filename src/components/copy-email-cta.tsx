"use client";

import { useState } from "react";

export type CopyEmailCtaProps = {
  className?: string;
  email: string;
};

export function CopyEmailCta({ className = "", email }: CopyEmailCtaProps) {
  const [tooltip, setTooltip] = useState("Copy");
  const [tooltipState, setTooltipState] = useState<"idle" | "visible" | "hiding">("idle");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setTooltip("Copied to clipboard");

    if (window.matchMedia("(hover: none)").matches) {
      setTooltipState("visible");
      window.setTimeout(() => {
        setTooltipState("hiding");
        window.setTimeout(() => {
          setTooltipState("idle");
          setTooltip("Copy");
        }, 300);
      }, 1500);
    }
  };

  const stateClass = tooltipState === "visible" ? "tooltip-visible" : tooltipState === "hiding" ? "tooltip-hiding" : "";

  return (
    <span
      className={`copy-email ${className} ${stateClass}`.trim()}
      data-email={email}
      data-tooltip={tooltip}
      onClick={copyEmail}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        void copyEmail();
      }}
      onMouseLeave={() => setTooltip("Copy")}
      role="button"
      tabIndex={0}
    >
      <span>{email}</span>
    </span>
  );
}
