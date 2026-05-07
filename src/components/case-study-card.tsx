import Link from "next/link";
import styles from "@/components/case-study-card.module.css";
import { caseStudyHref } from "@/lib/routes";
import type { CaseStudy } from "@/types/content";

type CaseStudyCardProps = {
  study: CaseStudy;
};

export function CaseStudyCard({ study }: CaseStudyCardProps) {
  return (
    <Link
      className={`${styles.card} card-surface`}
      href={caseStudyHref(study.slug)}
    >
      <div
        className={`${styles.media} ${
          study.theme === "ember" ? styles.themeEmber : styles.themeMoss
        }`}
      >
        <img src={study.coverMedia.src} alt={study.coverMedia.alt} />
      </div>
      <div className={styles.meta}>
        <span className="pill">{study.client}</span>
        {study.tags.map((tag) => (
          <span key={tag} className="pill">
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{study.title}</h3>
        <span>{study.year}</span>
      </div>
      <p className={styles.summary}>{study.summary}</p>
      <div className={styles.footer}>
        <span>{study.outcome}</span>
        <span>Open case study</span>
      </div>
    </Link>
  );
}
