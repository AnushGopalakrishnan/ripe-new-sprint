"use client";

import { useEffect, useRef, useState } from "react";

const COLLAPSED_LINES = 10;

export type CaseStudyFactProps = {
  label: string;
  children: string;
  styles: Record<string, string>;
};

export type CaseStudyInformationProps = {
  paragraphs: string[];
  styles: Record<string, string>;
};

export function CaseStudyFact({ label, children, styles }: CaseStudyFactProps) {
  return (
    <div className={styles.formaFact}>
      <p>({label})</p>
      <strong>{children}</strong>
    </div>
  );
}

function initialText(paragraphs: string[]) {
  return paragraphs.map((paragraph) => paragraph.replace(/<[^>]*>/g, " ")).join(" ").replace(/\s+/g, " ").trim();
}

function decodedText(paragraphs: string[]) {
  const container = document.createElement("div");
  return paragraphs
    .map((paragraph) => {
      container.innerHTML = paragraph;
      return container.textContent ?? "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function collapsedPreview(text: string, content: HTMLDivElement, computed: CSSStyleDeclaration, height: number) {
  const width = content.clientWidth;
  if (width <= 0 || text.length === 0) return text;

  const probe = document.createElement("p");
  Object.assign(probe.style, {
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontStyle: computed.fontStyle,
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight,
    margin: "0",
    pointerEvents: "none",
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "normal",
    width: `${width}px`,
  });
  document.body.appendChild(probe);

  let low = 0;
  let high = text.length;
  let best = "";
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid).trimEnd();
    probe.textContent = `${candidate}..`;
    if (probe.scrollHeight <= height + 1) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  document.body.removeChild(probe);
  const wordSafe = best.replace(/\s+\S*$/, "").trimEnd();
  return `${wordSafe || best.trimEnd()}..`;
}

export function CaseStudyInformation({ paragraphs, styles }: CaseStudyInformationProps) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [preview, setPreview] = useState(() => initialText(paragraphs));
  const contentRef = useRef<HTMLDivElement | null>(null);
  const contentKey = paragraphs.join("\n");

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => {
      const computed = window.getComputedStyle(content.querySelector("p") ?? content);
      const fontSize = Number.parseFloat(computed.fontSize) || 15;
      const parsedLineHeight = Number.parseFloat(computed.lineHeight);
      const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.38;
      const collapsedHeight = lineHeight * COLLAPSED_LINES;
      const text = decodedText(paragraphs);
      const nextCanExpand = content.scrollHeight > collapsedHeight + 1;
      setCanExpand(nextCanExpand);
      setPreview(nextCanExpand ? collapsedPreview(text, content, computed, collapsedHeight) : text);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [contentKey, paragraphs]);

  const showPreview = !expanded && canExpand;
  return (
    <div className={styles.formaInformation}>
      <p className={styles.formaLabel}>(Information)</p>
      <div
        ref={contentRef}
        aria-hidden={showPreview}
        className={`${styles.formaInformationCopy} ${showPreview ? styles.formaInformationCopyMeasure : ""}`}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`} dangerouslySetInnerHTML={{ __html: paragraph }} />
        ))}
      </div>
      {showPreview ? <div className={`${styles.formaInformationCopy} ${styles.formaInformationPreview}`}><p>{preview}</p></div> : null}
      {canExpand ? (
        <button
          aria-expanded={expanded}
          className={styles.formaInformationToggle}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? "See Less" : "See More"}
        </button>
      ) : null}
    </div>
  );
}
