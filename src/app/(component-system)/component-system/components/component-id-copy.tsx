"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicComponentId } from "@/components/component-system/registry";
import styles from "../component-system.module.css";

export function ComponentIdCopy({ id }: { id: PublicComponentId }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  }, []);

  const copyId = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      aria-label={copied ? `Copied component ID ${id}` : `Copy component ID ${id}`}
      className={styles.componentIdCopy}
      data-component-id-copy={id}
      onClick={() => void copyId()}
      title={copied ? "Copied" : `Copy ${id}`}
      type="button"
    >
      <code>{copied ? "Copied" : `/${id}`}</code>
      <span aria-live="polite" className={styles.componentIdStatus}>{copied ? "Copied" : ""}</span>
    </button>
  );
}
