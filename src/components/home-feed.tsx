"use client";

import { useEffect, useRef, useState } from "react";
import { resolveVideoPoster } from "@/lib/video-poster";
import styles from "./home-feed.module.css";

const images = {
  avantis: "/feed-assets/avantis-cube.png",
  maison: "/feed-media/maison.jpg",
  cutPaste: "/feed-media/cut-paste.jpg",
  tesla: "/feed-media/tesla.jpeg",
  mira: "/feed-assets/mira-shoes.png",
  oum: "/feed-assets/oum-ceramics.png",
  polestar: "/feed-media/polestar.jpg",
  artObjects: "/feed-media/art-objects.jpg",
  studio: "/feed-media/studio.jpg",
  dries: "/feed-media/dries.jpg",
  yangLi: "/feed-media/yang-li.jpg",
  margot: "/feed-media/margot.jpg",
  faune: "/feed-media/faune.jpg",
  rick: "/feed-media/rick.jpg",
  zeta: "/feed-assets/zetachain-bag.png",
};

const videos = {
  maison: "/feed-media/maison.mp4",
  polestar: "/feed-media/polestar.mp4",
};

const serviceWords = ["Strategy", "Identity", "Design", "Motion"];
const initialLondonTime = "00:00:00 AM";
const feedImageSizes = "(max-width: 767px) 100vw, 33vw";

const links = {
  about: "/team",
  article: "/writing",
  works: {
    artObjects: "/case-studies/case-study-17",
    cutPaste: "/case-studies/case-study-15",
    dries: "/case-studies/case-study-14",
    faune: "/case-studies/case-study-13",
    jacquemus: "/case-studies/case-study-12",
    maison: "/case-studies/case-study-11",
    margot: "/case-studies/case-study-10",
    nike: "/case-studies/case-study-9",
    polestar: "/case-studies/case-study-19",
    raf: "/case-studies/case-study-20",
    rick: "/case-studies/case-study-18",
    tesla: "/case-studies/zetachain",
    yangLi: "/case-studies/case-study-19",
  },
};

function londonTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Europe/London",
  })
    .format(new Date())
    .replace("am", "AM")
    .replace("pm", "PM");
}

function useLondonTime() {
  const [time, setTime] = useState(initialLondonTime);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTime(londonTime()), 0);
    const interval = window.setInterval(() => setTime(londonTime()), 1000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return time;
}

function useTypewriter(words: string[]) {
  const [wordIndex, setWordIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex] ?? "";
    const isComplete = visibleChars === currentWord.length;
    const isEmpty = visibleChars === 0;
    const delay = isComplete && !deleting ? 950 : deleting ? 55 : 85;

    const timeout = window.setTimeout(() => {
      if (!deleting && isComplete) {
        setDeleting(true);
        return;
      }

      if (deleting && isEmpty) {
        setDeleting(false);
        setWordIndex((index) => (index + 1) % words.length);
        return;
      }

      setVisibleChars((count) => count + (deleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [deleting, visibleChars, wordIndex, words]);

  return `${(words[wordIndex] ?? "").slice(0, visibleChars)}|`;
}

export type HomeFeedPillProps = { action?: string; children: string };

export function HomeFeedPill({ action, children }: HomeFeedPillProps) {
  return (
    <span className={styles.pill}>
      <span className={styles.pillLabel}>{children}</span>
      {action ? (
        <span className={styles.pillAction} aria-hidden="true">
          {action}
        </span>
      ) : null}
    </span>
  );
}

export type HomeFeedCardLinkProps = { href: string; label: string };

export function HomeFeedCardLink({ href, label }: HomeFeedCardLinkProps) {
  return <a className={styles.cardLink} href={href} aria-label={label} />;
}

function responsiveImageProps() {
  return { sizes: feedImageSizes };
}

export type HomeFeedSimpleCardProps = {
  action?: string;
  href?: string;
  label: string;
  title: string;
  size?: "small" | "medium" | "square";
};

export function HomeFeedSimpleCard({
  action,
  href,
  label,
  title,
  size = "small",
}: HomeFeedSimpleCardProps) {
  return (
    <article className={`${styles.card} ${href ? styles.interactive : ""} ${styles.textCard} ${styles[size]}`}>
      <HomeFeedPill action={action}>{label}</HomeFeedPill>
      <h3 className={`${styles.title} ${label === "Services" ? styles.servicesTitle : ""}`}>{title}</h3>
      {href ? <HomeFeedCardLink href={href} label={`${action ?? "Open"} ${title}`} /> : null}
    </article>
  );
}

type HomeFeedMediaCardBaseProps = {
  action?: string;
  href?: string;
  label?: string;
  title: string;
  src: string;
};

export type HomeFeedImageMediaCardProps = HomeFeedMediaCardBaseProps & {
  kind: "image";
  size?: "medium" | "square";
  position?: string;
};

export type HomeFeedVideoMediaCardProps = HomeFeedMediaCardBaseProps & {
  kind: "video";
  poster?: string;
};

export type HomeFeedMediaCardProps = HomeFeedImageMediaCardProps | HomeFeedVideoMediaCardProps;

export function HomeFeedMediaCard(props: HomeFeedMediaCardProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const isVideo = props.kind === "video";
  const action = props.action ?? "View";
  const label = props.label ?? "Work";
  const size = props.kind === "image" ? props.size ?? "square" : "square";

  useEffect(() => {
    if (!isVideo) return undefined;
    const article = articleRef.current;
    if (!article || shouldLoad) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "480px" },
    );

    observer.observe(article);
    return () => observer.disconnect();
  }, [isVideo, shouldLoad]);

  useEffect(() => {
    if (!isVideo || !shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    void video.play().catch(() => {
      // Browsers may delay autoplay until the card is painted or visible.
    });
  }, [isVideo, shouldLoad]);

  useEffect(() => {
    setHasFrame(false);
  }, [props.src]);

  const resolvedPoster = isVideo ? resolveVideoPoster({ poster: props.poster, src: props.src }) : undefined;

  return (
    <article
      ref={articleRef}
      className={`${styles.card} ${props.href ? styles.interactive : ""} ${styles.imageCard} ${styles[size]}`}
      data-video-ready={isVideo ? (hasFrame || resolvedPoster ? "true" : "false") : undefined}
      onFocusCapture={isVideo ? () => setShouldLoad(true) : undefined}
      onPointerEnter={isVideo ? () => setShouldLoad(true) : undefined}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          className={styles.media}
          src={shouldLoad ? props.src : undefined}
          poster={resolvedPoster}
          autoPlay
          muted
          loop
          playsInline
          preload={shouldLoad ? "metadata" : "none"}
          aria-hidden="true"
          onLoadedMetadata={() => setHasFrame(true)}
          onLoadedData={() => setHasFrame(true)}
          onCanPlay={() => setHasFrame(true)}
          onPlay={() => setHasFrame(true)}
          onError={() => setHasFrame(true)}
        />
      ) : (
        <img
          className={`${styles.media} ${styles.softImage}`}
          src={props.src}
          alt=""
          loading="lazy"
          {...responsiveImageProps()}
          style={props.position ? { objectPosition: props.position } : undefined}
        />
      )}
      <div className={styles.overlay} />
      <HomeFeedPill action={props.href ? action : undefined}>{label}</HomeFeedPill>
      {props.title ? <h3 className={styles.title}>{props.title}</h3> : null}
      {props.href ? <HomeFeedCardLink href={props.href} label={`${action} ${props.title || label}`} /> : null}
    </article>
  );
}

export type HomeFeedNewsCardProps = { href?: string; label: string; title: string; caption: string };

export function HomeFeedNewsCard({
  href,
  label,
  title,
  caption,
}: HomeFeedNewsCardProps) {
  return (
    <article className={`${styles.card} ${href ? styles.interactive : ""} ${styles.greenCard} ${styles.medium}`}>
      <HomeFeedPill action={href ? "Read" : undefined}>{label}</HomeFeedPill>
      <h3 className={styles.greenTitle}>{title}</h3>
      <p className={styles.caption}>{caption}</p>
      {href ? <HomeFeedCardLink href={href} label={`Read ${title}`} /> : null}
    </article>
  );
}

export type HomeFeedCopyCardProps = { href?: string; label?: string; children: string; large?: boolean };

export function HomeFeedCopyCard({
  href,
  label = "Studio",
  children,
  large = false,
}: HomeFeedCopyCardProps) {
  return (
    <article className={`${styles.card} ${href ? styles.interactive : ""} ${styles.textCard} ${styles.medium}`}>
      <HomeFeedPill action={href ? "About" : undefined}>{label}</HomeFeedPill>
      <p className={large ? styles.bigCopy : styles.bodyCopy}>{children}</p>
      {href ? <HomeFeedCardLink href={href} label="About Ripe Studios" /> : null}
    </article>
  );
}

export function HomeFeedTimeCard() {
  const time = useLondonTime();

  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.small}`}>
      <HomeFeedPill>Studio</HomeFeedPill>
      <p className={styles.timeCopy}>{time} / London</p>
    </article>
  );
}

export function HomeFeedLogosCard() {
  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.medium} ${styles.logosCard}`}>
      <HomeFeedPill>Clients</HomeFeedPill>
      <div className={styles.logos} aria-hidden="true">
        <div className={styles.logoTrack}>
          <span>ena</span>
          <span>Sensa</span>
          <span>FILIPPE MONET</span>
          <span>APEX I</span>
          <span>ena</span>
          <span>Sensa</span>
          <span>FILIPPE MONET</span>
          <span>APEX I</span>
        </div>
      </div>
    </article>
  );
}

export function HomeFeedAwardsCard() {
  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.small} ${styles.awards}`}>
      <HomeFeedPill>Recognition</HomeFeedPill>
      <h3 className={styles.title}>0 Awards</h3>
    </article>
  );
}

export function HomeFeedSoundsCard() {
  return (
    <article className={`${styles.card} ${styles.interactive} ${styles.textCard} ${styles.square} ${styles.soundsCard}`}>
      <HomeFeedPill action="Sounds">Studio</HomeFeedPill>
      <h3 className={styles.soundsTitle}>What we listen in the studio</h3>
      <div className={styles.playlistPanel} aria-label="Studio playlist">
        <span>Studio Playlist</span>
        <span>Ambient Systems</span>
        <span>Low Light Motion</span>
        <span>Late Session Notes</span>
      </div>
    </article>
  );
}

export type HomeFeedServicesCardProps = { word?: string };

export function HomeFeedServicesCard({ word }: HomeFeedServicesCardProps = {}) {
  const text = useTypewriter(serviceWords);
  const visibleText = word ?? text;

  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.small}`}>
      <HomeFeedPill>Services</HomeFeedPill>
      <h3 className={`${styles.title} ${styles.servicesTitle}`} aria-label={`Services: ${visibleText}`}>
        {visibleText}
      </h3>
    </article>
  );
}

export function HomeFeed() {
  const feedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const videos = Array.from(feed.querySelectorAll("video"));
    const playVideos = () => {
      for (const video of videos) {
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        void video.play().catch(() => {
          // Browsers may delay autoplay until the card is painted or visible.
        });
      }
    };

    playVideos();

    for (const video of videos) {
      video.addEventListener("loadeddata", playVideos);
      video.addEventListener("canplay", playVideos);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) playVideos();
      },
      { rootMargin: "240px" },
    );

    observer.observe(feed);
    document.addEventListener("visibilitychange", playVideos);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", playVideos);

      for (const video of videos) {
        video.removeEventListener("loadeddata", playVideos);
        video.removeEventListener("canplay", playVideos);
      }
    };
  }, []);

  return (
    <section ref={feedRef} className={styles.feed} aria-label="Featured work feed">
      <div className={styles.grid}>
        <div className={styles.column}>
          <HomeFeedSimpleCard action="View" href={links.works.raf} label="Case Study" title="Raf Simons" />
          <HomeFeedNewsCard
            href={links.article}
            label="Studio Thoughts"
            title="We built a new online presence!"
            caption="Rahul Kashyap"
          />
          <HomeFeedMediaCard kind="image" href={links.works.raf} label="Case Study" title="Avantis" src={images.avantis} />
          <HomeFeedCopyCard href={links.about} large>
            We are driven by concepts, dedicated to creating, expressing, and enhancing brand identities.
          </HomeFeedCopyCard>
          <HomeFeedMediaCard kind="image" href={links.works.cutPaste} title="Cut and Paste" src={images.cutPaste} />
          <HomeFeedTimeCard />
          <HomeFeedMediaCard kind="video" href={links.works.maison} title="Maison Margiela" src={videos.maison} poster={images.maison} />
          <HomeFeedMediaCard kind="image" href={links.works.tesla} title="Tesla Motors" src={images.tesla} />
        </div>

        <div className={styles.column}>
          <HomeFeedMediaCard kind="image" href={links.works.polestar} title="Bar Doubble" src={images.artObjects} position="center 48%" />
          <HomeFeedCopyCard href={links.about}>
            For us, everything begins with the strength of a compelling concept. Our methodology stems from transforming
            stories into unique and adaptable creations designed for growth and precision.
          </HomeFeedCopyCard>
          <HomeFeedLogosCard />
          <HomeFeedMediaCard kind="image" href={links.works.artObjects} title="Oum Ceramics" src={images.oum} position="center center" />
          <HomeFeedSimpleCard action="View" href={links.works.jacquemus} label="Work" title="Jacquemus" />
          <HomeFeedMediaCard kind="image" action="About" href={links.about} label="Studio" title="" src={images.studio} />
          <HomeFeedMediaCard
            kind="image"
            href={links.works.dries}
            title="Dries Van Noten"
            src={images.dries}
            size="medium"
            position="center 44%"
          />
          <HomeFeedAwardsCard />
          <HomeFeedMediaCard kind="image" href={links.works.yangLi} title="Yang Li" src={images.yangLi} size="medium" />
        </div>

        <div className={styles.column}>
          <HomeFeedMediaCard
            kind="image"
            href={links.works.margot}
            title="Mira"
            src={images.mira}
            size="medium"
            position="center 54%"
          />
          <HomeFeedNewsCard
            href={links.article}
            label="Case Study"
            title="Talk at the Art Directors Club"
            caption="Rahul Kashyap"
          />
          <HomeFeedMediaCard kind="image" href={links.works.faune} label="Case Study" title="Zetachain" src={images.zeta} />
          <HomeFeedServicesCard />
          <HomeFeedNewsCard
            href={links.article}
            label="Talk"
            title="Brand Identity"
            caption="Our founders will speak at the festival conference in Spain"
          />
          <HomeFeedMediaCard kind="image" href={links.works.rick} title="Rick Owens" src={images.rick} />
          <HomeFeedSimpleCard action="View" href={links.works.nike} label="Work" title="Nike" />
          <HomeFeedSoundsCard />
        </div>
      </div>
    </section>
  );
}
