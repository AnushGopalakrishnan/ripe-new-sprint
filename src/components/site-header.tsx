import Link from "next/link";
import styles from "@/components/site-header.module.css";
import type { NavLink } from "@/types/content";

type SiteHeaderProps = {
  nav: NavLink[];
};

export function SiteHeader({ nav }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className="page-grid">
        <div className={`${styles.bar} card-surface`}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandMark}>Ripe</span>
            <span className={styles.brandName}>Studios</span>
          </Link>
          <nav className={styles.nav} aria-label="Primary">
            {nav.map((item) => (
              <a key={item.href} className={styles.navLink} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
