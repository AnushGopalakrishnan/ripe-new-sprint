import { CaseStudyCard } from "@/components/case-study-card";
import { MediaPlayer } from "@/components/media-player";
import { WritingCard } from "@/components/writing-card";
import { getCaseStudies, getHomePage, getWritingPosts } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import styles from "@/app/(site)/home.module.css";

export const metadata = createMetadata({
  title: "Ripe Studios",
  description:
    "Custom marketing systems, editorial infrastructure, and motion-ready frontends built on Next.js and Sanity.",
  path: "/",
});

export default async function HomePage() {
  const [home, studies, posts] = await Promise.all([
    getHomePage(),
    getCaseStudies(),
    getWritingPosts(),
  ]);

  const featuredStudies = studies.filter((entry) =>
    home.featuredStudySlugs.includes(entry.slug)
  );
  const featuredPosts = posts.filter((entry) =>
    home.featuredWritingSlugs.includes(entry.slug)
  );

  return (
    <>
      <section className="section">
        <div className="page-grid">
          <div className={styles.hero}>
            <div className={`${styles.heroCopy} card-surface rise-in`}>
              <span className="eyebrow">{home.eyebrow}</span>
              <h1 className="headline">{home.title}</h1>
              <p className="lede">{home.summary}</p>
              <div className={styles.splitCopy}>
                <p className="rich-copy">
                  <span>{home.supportingCopy}</span>
                </p>
                <div className={styles.actions}>
                  <a className="button-link" href={home.primaryCta.href}>
                    {home.primaryCta.label}
                  </a>
                  <a className="outline-link" href={home.secondaryCta.href}>
                    {home.secondaryCta.label}
                  </a>
                </div>
              </div>
            </div>
            <div className={`${styles.heroMedia} card-surface rise-in`}>
              <MediaPlayer media={home.heroMedia} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-grid">
          <div className={styles.stats}>
            {home.stats.map((stat) => (
              <article key={stat.label} className={`${styles.statCard} card-surface`}>
                <span className={styles.statValue}>{stat.value}</span>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-grid">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Featured Work</span>
            <h2 className="section-title">
              Rebuilt around structure, not route-specific scripts.
            </h2>
            <p className="lede">
              The case-study templates are already wired for typed content,
              canonical URLs, and preview-friendly rendering.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {featuredStudies.map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-grid">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Writing Feed</span>
            <h2 className="section-title">
              Editorial publishing is part of the architecture, not an afterthought.
            </h2>
          </div>
          <div className={styles.featureGrid}>
            {featuredPosts.map((post) => (
              <WritingCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-grid">
          <div className="card-surface" style={{ padding: "1.4rem" }}>
            <div className={styles.sectionHead}>
              <span className="eyebrow">Core Stack</span>
              <h2 className="section-title">What this foundation already assumes</h2>
            </div>
            <div className={styles.marquee}>
              {home.marquee.map((item) => (
                <span key={item} className="pill">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
