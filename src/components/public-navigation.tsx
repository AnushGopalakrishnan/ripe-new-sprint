"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import detailStyles from "@/app/(site)/detail-page.module.css";
import { CaseStudyLongFormPlayer } from "@/components/case-study-long-form-player";
import styles from "@/components/public-navigation.module.css";
import type { NavLink, NavigationShowreel, SocialLink } from "@/types/content";

gsap.registerPlugin(Flip);

const fallbackPrimaryLinks: NavLink[] = [
  { label: "Work", href: "/work-new" },
  { label: "Services", href: "/services" },
  { label: "Writing", href: "/writing" },
  { label: "Team", href: "/team" },
  { label: "Careers", href: "/careers" },
];

const fallbackSocialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "X (Twitter)", href: "https://x.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

const policyLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const generatedShowreelPreviewSrc = "/nav-media/showreel-preview.gif";

const fallbackShowreel: Required<NavigationShowreel> = {
  video: {
    kind: "video",
    src: "/feed-media/polestar.mp4",
    alt: "Ripe showreel video",
  },
  title: "Ripe Showreel 2026",
};

type PublicNavigationProps = {
  contactEmail?: string;
  navLinks?: NavLink[];
  navigationShowreel?: NavigationShowreel;
  socialLinks?: SocialLink[];
};

function normalizeLinks<T extends { label?: string; href?: string }>(links: T[] | undefined, fallback: T[]) {
  const usable = links?.filter((item) => item.label?.trim() && item.href?.trim()) ?? [];
  return usable.length ? usable : fallback;
}

function isExternalHref(href: string) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function PublicNavigation({ contactEmail, navLinks, navigationShowreel, socialLinks }: PublicNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const previousPathnameRef = useRef(pathname);
  const showreelVideoRef = useRef<HTMLVideoElement | null>(null);
  const showreelTileRef = useRef<HTMLButtonElement | null>(null);
  const showreelPlayerRef = useRef<HTMLDivElement | null>(null);
  const showreelFlipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const active = open || closing;
  const primaryLinks = normalizeLinks(navLinks, fallbackPrimaryLinks);
  const secondaryLinks = normalizeLinks(socialLinks, fallbackSocialLinks);
  const email = contactEmail?.trim() || "hello@ripe.studio";
  const ctaHref = `mailto:${email}`;
  const showreelTitle = navigationShowreel?.title?.trim() || fallbackShowreel.title;
  const showreelVideo = navigationShowreel?.video?.src ? navigationShowreel.video : fallbackShowreel.video;
  const handleShowreelLoadedMetadata = useCallback(() => undefined, []);

  const openShowreelPlayer = useCallback(() => {
    if (showreelTileRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showreelFlipStateRef.current = Flip.getState(showreelTileRef.current);
    } else {
      showreelFlipStateRef.current = null;
    }

    setPlayerOpen(true);
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const openNavigation = useCallback(() => {
    clearCloseTimer();
    setPlayerOpen(false);
    setClosing(false);
    setOpen(true);
  }, [clearCloseTimer]);

  const closeNavigation = useCallback(() => {
    if (!open) return;

    clearCloseTimer();
    setPlayerOpen(false);
    setOpen(false);
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      closeTimerRef.current = null;
    }, 850);
  }, [clearCloseTimer, open]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    const frame = window.requestAnimationFrame(() => {
      clearCloseTimer();
      setPlayerOpen(false);
      setOpen(false);
      setClosing(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [clearCloseTimer, pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && playerOpen) {
        setPlayerOpen(false);
        return;
      }
      if (event.key === "Escape") closeNavigation();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeNavigation, playerOpen]);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;

    if (active) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
    };
  }, [active]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useLayoutEffect(() => {
    if (!playerOpen || !showreelPlayerRef.current) return;

    const state = showreelFlipStateRef.current;
    showreelFlipStateRef.current = null;

    const overlay = showreelPlayerRef.current.parentElement;
    if (overlay) {
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: state ? 0.2 : 0.01, ease: "power2.out" },
      );
    }

    if (!state) return;

    Flip.from(state, {
      targets: showreelPlayerRef.current,
      duration: 0.72,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      prune: true,
    });
  }, [playerOpen]);

  return (
    <>
      <header className={styles.header} data-open={active ? "true" : "false"}>
        <div className={styles.headerInner}>
          <Link aria-label="Ripe Studios home" className={styles.headerLogo} href="/" onClick={closeNavigation}>
            <RipeLogo />
          </Link>
          <button
            aria-controls="public-navigation-panel"
            aria-expanded={open}
            aria-label="Open navigation"
            className={styles.burger}
            onClick={openNavigation}
            type="button"
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <section
        aria-hidden={!open}
        className={styles.panel}
        data-open={open ? "true" : "false"}
        id="public-navigation-panel"
      >
        <div className={styles.panelBackground} />
        <div className={styles.closeBar}>
          <button aria-label="Close navigation" className={styles.closeButton} onClick={closeNavigation} type="button">
            <span />
            <span />
          </button>
        </div>
        <div className={styles.panelInner}>
          <div className={`${styles.panelColumn} ${styles.logoColumn}`}>
            <Link aria-label="Ripe Studios home" className={styles.panelLogo} href="/" onClick={closeNavigation}>
              <RipeLogo />
            </Link>
          </div>

          <div className={`${styles.panelColumn} ${styles.secondaryColumn}`}>
            <nav aria-label="Secondary">
              <ul className={styles.secondaryList}>
                {secondaryLinks.map((item) => (
                  <li key={item.href}>
                    <MenuLink item={item} onClick={closeNavigation} />
                  </li>
                ))}
              </ul>
              <ul className={`${styles.secondaryList} ${styles.policyList}`}>
                {policyLinks.map((item) => (
                  <li key={item.href}>
                    <MenuLink item={item} onClick={closeNavigation} />
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={`${styles.panelColumn} ${styles.primaryColumn}`}>
            <nav aria-label="Primary">
              <ul className={styles.primaryList}>
                {primaryLinks.map((item) => (
                  <li key={item.href}>
                    <MenuLink item={item} onClick={closeNavigation} />
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={`${styles.panelColumn} ${styles.showreelColumn}`}>
            <button
              ref={showreelTileRef}
              aria-label="Play Ripe showreel"
              className={styles.showreelButton}
              data-flip-id="navigation-showreel"
              onClick={openShowreelPlayer}
              type="button"
            >
              <div className={styles.showreelButtonInner}>
                <img alt="" className={styles.showreelPreview} src={generatedShowreelPreviewSrc} />
                <span className={styles.showreelMeta}>
                  <span style={{"opacity":"0.5"}}>{showreelTitle}</span>
                  <span>Play</span>
                </span>
              </div>
            </button>
          </div>

          <div className={`${styles.panelColumn} ${styles.ctaColumn}`}>
            <a className={styles.contactCta} href={ctaHref} onClick={closeNavigation}>
              Get in Touch
            </a>
          </div>
        </div>

        {playerOpen ? (
          <div aria-modal="true" className={styles.playerOverlay} role="dialog">
            <button
              aria-label="Close showreel"
              className={styles.playerBackdrop}
              onClick={() => setPlayerOpen(false)}
              type="button"
            />
            <div ref={showreelPlayerRef} className={styles.playerShell} data-flip-id="navigation-showreel">
              <button
                aria-label="Close showreel"
                className={styles.playerCloseButton}
                onClick={() => setPlayerOpen(false)}
                type="button"
              >
                <span />
                <span />
              </button>
              <CaseStudyLongFormPlayer
                styles={detailStyles}
                mediaClassName={styles.playerVideo}
                src={showreelVideo.src}
                poster={showreelVideo.poster || generatedShowreelPreviewSrc}
                preload="auto"
                videoRef={showreelVideoRef}
                onLoadedMetadata={handleShowreelLoadedMetadata}
              />
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

function MenuLink({ item, onClick }: { item: NavLink | SocialLink; onClick: () => void }) {
  if (isExternalHref(item.href)) {
    return (
      <a href={item.href} onClick={onClick} rel="noreferrer" target="_blank">
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href as Route} onClick={onClick}>
      {item.label}
    </Link>
  );
}

function RipeLogo() {
  return (
    <svg aria-hidden="true" className={styles.logoSvg} fill="none" viewBox="0 0 58 27" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.24973 10.0503C12.0497 10.0503 13.9497 8.66031 13.9497 5.88031C13.9497 4.30031 13.4597 3.13031 12.4797 2.37031C11.5197 1.61031 10.1697 1.23031 8.42973 1.23031H5.84973V10.0503H8.24973ZM10.1997 0.360311C11.1397 0.360311 12.0297 0.480312 12.8697 0.720312C13.7297 0.960311 14.4797 1.31031 15.1197 1.77031C15.7597 2.21031 16.2597 2.76031 16.6197 3.42031C16.9997 4.06031 17.1897 4.78031 17.1897 5.58031C17.1897 6.88031 16.7097 7.98031 15.7497 8.88031C14.7897 9.78031 13.3697 10.3703 11.4897 10.6503C12.0097 11.2503 12.4997 11.8003 12.9597 12.3003C13.4197 12.7803 13.7497 13.1303 13.9497 13.3503L17.3697 17.3403C17.8497 17.8803 18.2597 18.3203 18.5997 18.6603C18.9597 19.0003 19.2797 19.2603 19.5597 19.4403C19.8597 19.6203 20.1197 19.7403 20.3397 19.8003C20.5597 19.8603 20.7697 19.8903 20.9697 19.8903V20.5203C20.0897 20.7203 19.3297 20.8203 18.6897 20.8203C18.2697 20.8203 17.8797 20.7703 17.5197 20.6703C17.1797 20.5703 16.8297 20.4003 16.4697 20.1603C16.1097 19.9203 15.7397 19.6203 15.3597 19.2603C14.9797 18.8803 14.5697 18.4203 14.1297 17.8803L9.14973 11.9103C8.96973 11.6903 8.77973 11.5103 8.57973 11.3703C8.37973 11.2303 8.06973 11.1603 7.64973 11.1603H5.84973V17.4003C5.84973 18.3603 6.04973 19.0303 6.44973 19.4103C6.86973 19.7703 7.59973 19.9503 8.63973 19.9503H8.90973V20.8203H-0.000273421V19.9503H0.269727C1.30973 19.9503 2.02973 19.7803 2.42973 19.4403C2.84973 19.0803 3.05973 18.4003 3.05973 17.4003V3.69031C3.05973 2.83031 2.86973 2.21031 2.48973 1.83031C2.10973 1.43031 1.38973 1.23031 0.329727 1.23031H-0.000273421V0.360311H10.1997ZM26.2952 17.6103C26.2952 18.4303 26.4252 19.0403 26.6852 19.4403C26.9452 19.8403 27.5152 20.0403 28.3952 20.0403V20.8203H21.6152V20.0403C22.0552 20.0403 22.4252 20.0103 22.7252 19.9503C23.0252 19.8903 23.2652 19.7703 23.4452 19.5903C23.6252 19.4103 23.7552 19.1603 23.8352 18.8403C23.9152 18.5003 23.9552 18.0603 23.9552 17.5203V9.75031L21.7652 8.76031V8.31031L26.2952 7.02031V17.6103ZM26.6252 1.53031C26.6252 1.95031 26.4752 2.31031 26.1752 2.61031C25.8752 2.91031 25.5152 3.06031 25.0952 3.06031C24.6752 3.06031 24.3152 2.91031 24.0152 2.61031C23.7152 2.31031 23.5652 1.95031 23.5652 1.53031C23.5652 1.11031 23.7152 0.750312 24.0152 0.450312C24.3152 0.150312 24.6752 0.000312328 25.0952 0.000312328C25.5152 0.000312328 25.8752 0.150312 26.1752 0.450312C26.4752 0.750312 26.6252 1.11031 26.6252 1.53031ZM33.8782 15.6603C33.8782 16.3003 33.9782 16.9003 34.1782 17.4603C34.3782 18.0003 34.6582 18.4703 35.0182 18.8703C35.3982 19.2703 35.8382 19.5903 36.3382 19.8303C36.8582 20.0703 37.4282 20.1903 38.0482 20.1903C39.3082 20.1903 40.3182 19.7003 41.0782 18.7203C41.8382 17.7203 42.2182 16.4003 42.2182 14.7603C42.2182 13.8403 42.0982 13.0103 41.8582 12.2703C41.6382 11.5103 41.3182 10.8703 40.8982 10.3503C40.4982 9.83031 40.0082 9.43031 39.4282 9.15031C38.8482 8.87031 38.2082 8.73031 37.5082 8.73031C36.8882 8.73031 36.2782 8.88031 35.6782 9.18031C35.0982 9.46031 34.4982 9.92031 33.8782 10.5603V15.6603ZM33.8782 9.54031C35.4382 7.86031 37.0882 7.02031 38.8282 7.02031C39.6482 7.02031 40.4082 7.19031 41.1082 7.53031C41.8082 7.85031 42.4082 8.30031 42.9082 8.88031C43.4282 9.44031 43.8282 10.1103 44.1082 10.8903C44.4082 11.6703 44.5582 12.5103 44.5582 13.4103C44.5582 14.4503 44.3582 15.4403 43.9582 16.3803C43.5782 17.3003 43.0582 18.1203 42.3982 18.8403C41.7582 19.5403 41.0082 20.1003 40.1482 20.5203C39.3082 20.9403 38.4182 21.1503 37.4782 21.1503C36.1582 21.1503 34.9582 20.7803 33.8782 20.0403V23.5203C33.8782 23.9403 33.8982 24.2903 33.9382 24.5703C33.9782 24.8503 34.0882 25.0703 34.2682 25.2303C34.4482 25.3903 34.7082 25.5003 35.0482 25.5603C35.4082 25.6403 35.9082 25.6803 36.5482 25.6803V26.4603H29.3782V25.6803C30.2182 25.6803 30.7882 25.5403 31.0882 25.2603C31.3882 25.0003 31.5382 24.5803 31.5382 24.0003V9.78031L29.3782 8.76031V8.34031L33.8782 7.02031V9.54031ZM55.1854 11.4603C55.0654 10.3203 54.7254 9.44031 54.1654 8.82031C53.6054 8.20031 52.8754 7.89031 51.9754 7.89031C51.1354 7.89031 50.3854 8.22031 49.7254 8.88031C49.0854 9.52031 48.6754 10.3803 48.4954 11.4603H55.1854ZM48.3754 12.3003V12.8103C48.3754 13.7703 48.5154 14.6303 48.7954 15.3903C49.0754 16.1503 49.4554 16.8003 49.9354 17.3403C50.4354 17.8803 51.0154 18.3003 51.6754 18.6003C52.3354 18.8803 53.0454 19.0203 53.8054 19.0203C54.5654 19.0203 55.2154 18.9003 55.7554 18.6603C56.2954 18.4203 56.8754 17.9903 57.4954 17.3703L58.0054 17.8803C56.5454 20.0603 54.7554 21.1503 52.6354 21.1503C51.7354 21.1503 50.8954 20.9903 50.1154 20.6703C49.3554 20.3303 48.6954 19.8603 48.1354 19.2603C47.5754 18.6403 47.1354 17.9003 46.8154 17.0403C46.4954 16.1803 46.3354 15.2303 46.3354 14.1903C46.3354 13.1703 46.4854 12.2203 46.7854 11.3403C47.0854 10.4603 47.5054 9.70031 48.0454 9.06031C48.5854 8.42031 49.2354 7.92031 49.9954 7.56031C50.7554 7.20031 51.5854 7.02031 52.4854 7.02031C53.2454 7.02031 53.9554 7.16031 54.6154 7.44031C55.2754 7.70031 55.8454 8.07031 56.3254 8.55031C56.8254 9.01031 57.2154 9.57031 57.4954 10.2303C57.7954 10.8703 57.9654 11.5603 58.0054 12.3003H48.3754Z"
        fill="currentColor"
      />
    </svg>
  );
}
