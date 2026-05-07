import { CaseStudyCard } from "@/components/case-study-card";
import { getCaseStudies } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import styles from "@/app/(site)/index-page.module.css";

export const metadata = createMetadata({
  title: "Case Studies",
  description:
    "Selected work rebuilt on a typed marketing stack: case-study index, detail templates, and preview-aware content rendering.",
  path: "/case-studies",
});

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies();

  return (
    <section className="section">
      <div className="page-grid">
        <div className={`${styles.hero} card-surface`}>
          <span className="eyebrow">Case Studies</span>
          <h1 className="headline">A cleaner index for richer project storytelling.</h1>
          <p className="lede">
            This route replaces legacy grid scripts with straightforward
            component rendering, opening the door for filter controls, list
            toggles, and hover treatments without global DOM selectors.
          </p>
        </div>
        <div className={styles.collection}>
          {studies.map((study) => (
            <CaseStudyCard key={study.slug} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
