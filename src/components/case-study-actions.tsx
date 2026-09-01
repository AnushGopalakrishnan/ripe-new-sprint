"use client";

export type CaseStudyCarouselButtonProps = {
  direction: "previous" | "next";
  onClick: () => void;
  styles: Record<string, string>;
};

export function CaseStudyCarouselButton({ direction, onClick, styles }: CaseStudyCarouselButtonProps) {
  const next = direction === "next";
  return (
    <button
      className={`${styles.formaArrow} ${next ? styles.formaArrowNext : ""}`.trim()}
      aria-label={`${next ? "Next" : "Previous"} project image`}
      onClick={onClick}
      type="button"
    >
      {next ? "→" : "←"}
    </button>
  );
}
