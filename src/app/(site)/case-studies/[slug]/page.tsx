import { notFound } from "next/navigation";
import { MediaPlayer } from "@/components/media-player";
import { getCaseStudies, getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/content";
import { caseStudyHref } from "@/lib/routes";
import { createMetadata } from "@/lib/metadata";
import styles from "@/app/(site)/detail-page.module.css";

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);

  if (!study) {
    return createMetadata({
      title: "Case Study",
      description: "Selected work from Ripe Studios.",
      path: "/case-studies",
    });
  }

  return createMetadata({
    title: study.seo.title || study.title,
    description: study.seo.description || study.summary,
    path: caseStudyHref(study.slug),
  });
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const [study, studies] = await Promise.all([
    getCaseStudyBySlug(slug),
    getCaseStudies(),
  ]);

  if (!study) {
    notFound();
  }

  const related = studies
    .filter((entry) => entry.slug !== study.slug)
    .slice(0, 2);

  return (
    <section className="section">
      <div className="page-grid">
        <div className={styles.hero}>
          <div className={`${styles.copy} card-surface`}>
            <span className="eyebrow">{study.client}</span>
            <h1 className="headline">{study.title}</h1>
            <div className={styles.meta}>
              <span className="pill">{study.year}</span>
              {study.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
            <p className="lede">{study.summary}</p>
            <div className="rich-copy">
              <p>{study.challenge}</p>
              <p>{study.outcome}</p>
            </div>
          </div>
          <div className={`${styles.media} card-surface`}>
            <MediaPlayer media={study.coverMedia} />
          </div>
        </div>

        <div className={styles.metrics}>
          {study.metrics.map((metric) => (
            <article key={metric.label} className={`${styles.metric} card-surface`}>
              <span className={styles.metricValue}>{metric.value}</span>
              <strong>{metric.label}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>

        <div className={styles.sections}>
          {study.sections.map((section) => (
            <article key={section.title} className={`${styles.sectionCard} card-surface`}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <div className="rich-copy">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.quote ? <blockquote>{section.quote}</blockquote> : null}
              </div>
            </article>
          ))}
        </div>

        {related.length ? (
          <div className={styles.sections} style={{ marginTop: "1.6rem" }}>
            <div>
              <span className="eyebrow">Related Work</span>
              <h2 className="section-title">More migration-ready case studies.</h2>
            </div>
            {related.map((entry) => (
              <article key={entry.slug} className={`${styles.sectionCard} card-surface`}>
                <p className="eyebrow">{entry.client}</p>
                <h3 className={styles.sectionTitle}>{entry.title}</h3>
                <p className="rich-copy">{entry.summary}</p>
                <a className="outline-link" href={caseStudyHref(entry.slug)}>
                  Open case study
                </a>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
