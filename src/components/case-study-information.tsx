"use client";

import { useEffect, useRef, useState } from "react";

const COLLAPSED_LINES = 10;

export type CaseStudyFactProps = {
  label: string;
  children: string;
  styles: Record<string, string>;
};

export type CaseStudyInformationProps = {
  defaultExpanded?: boolean;
  paragraphs: string[];
  styles: Record<string, string>;
};

export type CaseStudyDisclosureButtonProps = {
  expanded: boolean;
  onToggle: () => void;
  styles: Record<string, string>;
};

export function CaseStudyDisclosureButton({ expanded, onToggle, styles }: CaseStudyDisclosureButtonProps) {
  return (
    <button
      aria-expanded={expanded}
      className={styles.formaInformationToggle}
      onClick={onToggle}
      type="button"
    >
      {expanded ? "See Less" : "See More"}
    </button>
  );
}

export function CaseStudyFact({ label, children, styles }: CaseStudyFactProps) {
  return (
    <div className={styles.formaFact}>
      <p>({label})</p>
      <strong>{children}</strong>
    </div>
  );
}

function initialParagraphs(paragraphs: string[]) {
  return paragraphs.map((paragraph) => paragraph
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .trim());
}

function decodedParagraphs(paragraphs: string[]) {
  const container = document.createElement("div");
  return paragraphs.map((paragraph) => {
    container.innerHTML = paragraph.replace(/<br\s*\/?\s*>/gi, "\n");
    return (container.textContent ?? "").replace(/[^\S\n]+/g, " ").trim();
  });
}

function slicedParagraphs(paragraphs: string[], length: number) {
  const result: string[] = [];
  let remaining = length;

  for (const paragraph of paragraphs) {
    if (result.length > 0) remaining -= 1;
    if (remaining < 0) break;
    if (remaining >= paragraph.length) {
      result.push(paragraph);
      remaining -= paragraph.length;
      continue;
    }
    result.push(paragraph.slice(0, remaining));
    break;
  }

  return result;
}

function withEllipsis(paragraphs: string[]) {
  const result = [...paragraphs];
  const lastIndex = result.length - 1;
  if (lastIndex < 0) return result;
  const last = result[lastIndex].trimEnd();
  const wordSafe = last.replace(/\s+\S*$/, "").trimEnd();
  result[lastIndex] = `${wordSafe || last}..`;
  return result;
}

function collapsedPreview(paragraphs: string[], content: HTMLDivElement, height: number) {
  const width = content.clientWidth;
  if (width <= 0 || paragraphs.every((paragraph) => paragraph.length === 0)) return paragraphs;

  const probe = content.cloneNode(false) as HTMLDivElement;
  Object.assign(probe.style, {
    left: "0",
    pointerEvents: "none",
    position: "absolute",
    top: "-9999px",
    visibility: "hidden",
    width: `${width}px`,
  });
  content.parentElement?.appendChild(probe);

  const renderProbe = (candidate: string[]) => {
    probe.replaceChildren(...candidate.map((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      return element;
    }));
  };

  let low = 0;
  let high = paragraphs.reduce((length, paragraph) => length + paragraph.length, Math.max(0, paragraphs.length - 1));
  let best: string[] = [];
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = slicedParagraphs(paragraphs, mid);
    renderProbe(withEllipsis(candidate));
    if (probe.scrollHeight <= height + 1) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  probe.remove();
  return withEllipsis(best);
}

export function CaseStudyInformation({ defaultExpanded = false, paragraphs, styles }: CaseStudyInformationProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [canExpand, setCanExpand] = useState(false);
  const [preview, setPreview] = useState(() => initialParagraphs(paragraphs));
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
      const text = decodedParagraphs(paragraphs);
      const nextCanExpand = content.scrollHeight > collapsedHeight + 1;
      setCanExpand(nextCanExpand);
      setPreview(nextCanExpand ? collapsedPreview(text, content, collapsedHeight) : text);
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
      {showPreview ? <div className={`${styles.formaInformationCopy} ${styles.formaInformationPreview}`}>{preview.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}</div> : null}
      {canExpand ? (
        <CaseStudyDisclosureButton
          expanded={expanded}
          onToggle={() => setExpanded((current) => !current)}
          styles={styles}
        />
      ) : null}
    </div>
  );
}
