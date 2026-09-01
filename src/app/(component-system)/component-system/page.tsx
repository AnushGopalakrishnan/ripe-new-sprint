import Link from "next/link";
import styles from "./component-system.module.css";

export default function ComponentSystemPage() {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Ripe Studios / Living interface reference</p>
          <h1 className={styles.heroTitle}>Component System</h1>
        </div>
        <p className={styles.heroCopy}>A verified reference for the shared visual source and production components currently in use.</p>
      </section>
      <section className={styles.choiceGrid} aria-label="Component system areas">
        <Link className={styles.choice} href="/component-system/styles">
          <span className={styles.eyebrow}>01 / Foundations</span>
          <div>
            <h2>Styles</h2>
            <p>Typography, color, spacing, borders, breakpoints, icon treatment, motion and theme contexts.</p>
          </div>
        </Link>
        <Link className={styles.choice} href="/component-system/components">
          <span className={styles.eyebrow}>02 / Shared source</span>
          <div>
            <h2>Components</h2>
            <p>Current shared React components rendered with clearly labelled local specimen content.</p>
          </div>
        </Link>
      </section>
    </>
  );
}
