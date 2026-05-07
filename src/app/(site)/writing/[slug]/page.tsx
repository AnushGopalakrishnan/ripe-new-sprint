import { notFound } from "next/navigation";
import { getWritingPostBySlug, getWritingPostSlugs } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { createMetadata } from "@/lib/metadata";
import { writingHref } from "@/lib/routes";
import styles from "@/app/(site)/detail-page.module.css";

type WritingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getWritingPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WritingPageProps) {
  const { slug } = await params;
  const post = await getWritingPostBySlug(slug);

  if (!post) {
    return createMetadata({
      title: "Writing",
      description: "Editorial notes from Ripe Studios.",
      path: "/writing",
    });
  }

  return createMetadata({
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    path: writingHref(post.slug),
  });
}

export default async function WritingPostPage({ params }: WritingPageProps) {
  const { slug } = await params;
  const post = await getWritingPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="section">
      <div className="page-grid">
        <div className={styles.hero}>
          <article className={`${styles.copy} card-surface`}>
            <span className="eyebrow">{post.category}</span>
            <h1 className="headline">{post.title}</h1>
            <div className={styles.articleMeta}>
              <span>{post.author}</span>
              <span>{formatDate(post.publishDate)}</span>
              <span>{post.readTime}</span>
            </div>
            <p className="lede">{post.excerpt}</p>
          </article>
          <div className={`${styles.media} card-surface`}>
            <img
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "32px" }}
              src={post.coverMedia.src}
              alt={post.coverMedia.alt}
            />
          </div>
        </div>

        <div className={styles.sections}>
          {post.body.map((section) => (
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
      </div>
    </section>
  );
}
