import Link from "next/link";
import styles from "@/components/writing-card.module.css";
import { formatDate } from "@/lib/format";
import { writingHref } from "@/lib/routes";
import type { WritingPost } from "@/types/content";

type WritingCardProps = {
  post: WritingPost;
};

export function WritingCard({ post }: WritingCardProps) {
  return (
    <Link className={`${styles.card} card-surface`} href={writingHref(post.slug)}>
      <div className={styles.media}>
        <img src={post.coverMedia.src} alt={post.coverMedia.alt} />
      </div>
      <div className={styles.meta}>
        <span>{post.category}</span>
        <span>{formatDate(post.publishDate)}</span>
        <span>{post.readTime}</span>
      </div>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.excerpt}>{post.excerpt}</p>
    </Link>
  );
}
