import type { Metadata } from "next";
import Link from "next/link";
import styles from "./component-system.module.css";

export const metadata: Metadata = {
  title: { default: "Component System | Ripe Studios", template: "%s | Ripe Component System" },
  robots: { index: false, follow: false },
};

export default function ComponentSystemLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.system} data-component-system="">
      {/* eslint-disable-next-line @next/next/no-css-tags -- Component specimens must load the exact exported public CSS. */}
      <link rel="stylesheet" href="/css/normalize.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Component specimens must load the exact exported public CSS. */}
      <link rel="stylesheet" href="/css/webflow.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Component specimens must load the exact exported public CSS. */}
      <link rel="stylesheet" href="/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css" />
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/component-system">
          <span>Ripe</span>
          <span className={styles.systemLabel}>Component System</span>
        </Link>
        <nav className={styles.tabs} aria-label="Component system sections">
          <Link href="/component-system/styles">Styles</Link>
          <Link href="/component-system/components">Components</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footerNote}>
        <span>Ripe Studios component system</span>
        <Link className={styles.backLink} href="/">Back to site</Link>
      </footer>
    </div>
  );
}
