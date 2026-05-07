import { WritingCard } from "@/components/writing-card";
import { getWritingPosts } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import styles from "@/app/(site)/index-page.module.css";

export const metadata = createMetadata({
  title: "Writing",
  description:
    "Writing templates and editorial feed scaffolding for the rebuilt Ripe Studios site.",
  path: "/writing",
});

export default async function WritingIndexPage() {
  const posts = await getWritingPosts();

  return (
    <section className="section">
      <div className="page-grid">
        <div className={`${styles.hero} card-surface`}>
          <span className="eyebrow">Writing</span>
          <h1 className="headline">A feed that can publish without a JavaScript maze.</h1>
          <p className="lede">
            The writing index is already mapped to typed entries, ready for richer
            category filters, featured rows, and editorial modules once real Sanity
            content is connected.
          </p>
        </div>
        <div className={styles.collection}>
          {posts.map((post) => (
            <WritingCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
