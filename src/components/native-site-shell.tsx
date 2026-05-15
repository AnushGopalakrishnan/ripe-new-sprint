import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./native-site-shell.module.css";

type RipeSiteShellProps = {
  children: ReactNode;
};

export function RipeSiteShell({ children }: RipeSiteShellProps) {
  return (
    <div className={styles.site}>
      <RipeHeader />
      {children}
      <RipeFooter />
    </div>
  );
}

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <div className={`h1-wrap ${styles.titleWrap}`}>
        <p className={styles.kicker}>The</p>
        <h1 id="home-hero-heading" aria-label="Natural Outcome" className={styles.title}>
          Natural
          <br />
          Outcome
        </h1>
      </div>
      <div className={styles.heroCards} aria-label="Selected case studies">
        <Link href="/case-studies/sticky-notes" className={styles.heroCard}>
          <Image
            alt=""
            className={styles.heroCardImage}
            height={640}
            priority
            src="/work-media/sticky-notes.png"
            width={520}
          />
          <span className={styles.heroCardMeta}>Sticky Notes</span>
        </Link>
        <Link href="/case-studies/zetachain" className={styles.heroCard}>
          <Image
            alt=""
            className={styles.heroCardImage}
            height={640}
            priority
            src="/work-media/zetachain.png"
            width={520}
          />
          <span className={styles.heroCardMeta}>ZetaChain</span>
        </Link>
      </div>
    </section>
  );
}

function RipeHeader() {
  return (
    <header className={styles.header} data-site-nav="">
      <Link aria-label="Go to homepage" className={styles.logoLink} href="/">
        <svg aria-hidden="true" className={styles.logo} viewBox="0 0 86 34">
          <path
            d="M4 30V4h18.3c6.6 0 10.8 3.6 10.8 9.4 0 3.9-2 6.8-5.4 8.2L34 30H23.5l-5.2-7.4h-5V30H4Zm9.3-14.5h7.6c1.7 0 2.8-.8 2.8-2.2s-1.1-2.2-2.8-2.2h-7.6v4.4Zm25 14.5V4h9.3v26h-9.3Zm15.2 0V4h18.2c6.9 0 11.1 3.8 11.1 10s-4.2 10-11.1 10h-8.9v6h-9.3Zm9.3-13.1h7.6c1.9 0 3-1 3-2.8s-1.1-2.8-3-2.8h-7.6v5.6Z"
            data-site-nav-logo=""
            fill="currentColor"
          />
        </svg>
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        <Link href="/work-new">Work</Link>
        <Link href="/writing">Writing</Link>
        <Link href="/team">Team</Link>
      </nav>
      <button className={styles.menuButton} type="button" aria-label="Menu">
        <span data-site-nav-menu="">Menu</span>
        <span className={styles.menuDot} data-site-nav-dot="" />
      </button>
    </header>
  );
}

function RipeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>Ripe Studios</div>
      <div className={styles.footerLinks}>
        <Link href="/work-new">Work</Link>
        <Link href="/writing">Writing</Link>
        <Link href="/team">Team</Link>
        <a href="mailto:hello@ripestudios.co">hello@ripestudios.co</a>
      </div>
    </footer>
  );
}
