"use client";

import { useState } from "react";
import detailStyles from "@/app/(site)/detail-page.module.css";
import { CaseStudyCommentNote } from "@/components/case-study-comment-note";

export type CommentSpecimenProps = {
  author?: string;
  body?: string;
  defaultOpen?: boolean;
  expandDown?: boolean;
  expandLeft?: boolean;
  x?: number;
  y?: number;
  variant?: string;
};

export function CommentSpecimen({
  author = "Ripe Studios",
  body = "A shared production note component.",
  defaultOpen = false,
  expandDown = true,
  expandLeft = true,
  x = 58,
  y = 42,
  variant,
}: CommentSpecimenProps) {
  const [active, setActive] = useState(defaultOpen || variant === "open");

  return (
    <div className={detailStyles.detailCommentable} style={{ position: "relative", aspectRatio: "16 / 9", maxWidth: 900 }}>
      <img
        className={detailStyles.formaMedia}
        src="/case-detail-media/hero.jpg"
        alt="Case-study media with a placed note"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <CaseStudyCommentNote
        comment={{ author, body }}
        index={0}
        isActive={active}
        x={`${x}%`}
        y={`${y}%`}
        expandLeft={variant === "edge-aware" ? true : expandLeft}
        expandDown={variant === "edge-aware" ? true : expandDown}
        styles={detailStyles}
        buttonProps={{ onClick: () => setActive((current) => !current) }}
      />
    </div>
  );
}
