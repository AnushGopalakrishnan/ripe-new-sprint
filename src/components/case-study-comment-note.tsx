"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";

export type CaseStudyCommentNoteData = {
  author: string;
  avatar?: string;
  body: string;
};

export type CaseStudyCommentNoteProps = {
  comment: CaseStudyCommentNoteData;
  index: number;
  isActive: boolean;
  x: number | string;
  y: number | string;
  expandLeft?: boolean;
  expandDown?: boolean;
  styles: Record<string, string>;
  buttonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "style">;
};

export function CaseStudyCommentNote({
  buttonProps,
  comment,
  expandDown,
  expandLeft,
  index,
  isActive,
  styles,
  x,
  y,
}: CaseStudyCommentNoteProps) {
  const threadClasses = [
    styles.detailCommentThread,
    isActive ? styles.detailCommentThreadOpen : "",
    expandLeft ? styles.detailCommentThreadExpandLeft : "",
    expandDown ? styles.detailCommentThreadExpandDown : "",
  ].filter(Boolean).join(" ");
  const position = {
    "--comment-x": typeof x === "number" ? `${x}px` : x,
    "--comment-y": typeof y === "number" ? `${y}px` : y,
  } as CSSProperties;

  return (
    <div className={threadClasses} style={position}>
      <button
        {...buttonProps}
        aria-expanded={isActive}
        aria-label={buttonProps?.["aria-label"] ?? `Open and drag note ${index + 1}`}
        className={styles.detailCommentSurface}
        type="button"
      >
        <span className={`${styles.detailCommentAvatarWrap} ${comment.avatar ? styles.detailCommentAvatarWrapWithImage : ""}`}>
          {comment.avatar ? (
            <img className={styles.detailCommentAvatar} src={comment.avatar} alt={comment.author} loading="lazy" decoding="async" />
          ) : (
            <span className={styles.detailCommentAvatarFallback} aria-hidden="true" />
          )}
        </span>
        <span className={styles.detailCommentCard}>
          <span className={styles.detailCommentAuthor}>{comment.author}</span>
          <span className={styles.detailCommentBody}>{comment.body}</span>
        </span>
      </button>
    </div>
  );
}
