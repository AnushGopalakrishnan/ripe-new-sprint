"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./studio-b-feed.module.css";

const images = {
  avantis: "/feed-assets/avantis-cube.png",
  maison: "https://framerusercontent.com/images/PJ4eIw910N92PRbWoU7G8dQpCSQ.jpg",
  cutPaste: "https://framerusercontent.com/images/TDVqw1tqR6Xs2CRjqnICnaPpH1o.jpg",
  tesla: "https://framerusercontent.com/images/1tWZIqC7cLcjzMvm9KUZIoIEH0.jpeg",
  mira: "/feed-assets/mira-shoes.png",
  oum: "/feed-assets/oum-ceramics.png",
  polestar: "https://framerusercontent.com/images/Tlpib4CyrbdqyderduT9vzAadsc.jpg",
  artObjects: "https://framerusercontent.com/images/9iUqmRc0mCszgnoIcbHNK758gck.jpg",
  studio: "https://framerusercontent.com/images/YJ7KrAOMijDmR3aacD3lI8YfOC4.jpg?width=1280&height=853",
  dries: "https://framerusercontent.com/images/nwabeIJBn9YTGH9qZPPHlf13mM.jpg",
  yangLi: "https://framerusercontent.com/images/ez21OQNZzW1WsIvb3E0iXlwNw8.jpg",
  margot: "https://framerusercontent.com/images/5w8O1Tx5e1JaHayg8lfISv2Mw.jpg",
  faune: "https://framerusercontent.com/images/hWuHSaij56zc0oBboEog12rtI.jpg",
  rick: "https://framerusercontent.com/images/nKHExlWmSBMLnqfZuSBVnUtNPPw.jpg",
  zeta: "/feed-assets/zetachain-bag.png",
};

const videos = {
  maison: "https://ena-supply.b-cdn.net/Studio%20B/cottenbro%20(1).mp4",
  polestar: "https://ena-supply.b-cdn.net/Studio%20B/pexels-yaroslav-shuraev-5418124%20trim%20(1).mp4",
};

const serviceWords = ["Strategy", "Identity", "Design", "Motion"];
const initialLondonTime = "00:00:00 AM";
const feedImageSizes = "(max-width: 767px) 100vw, 33vw";
const responsiveImageWidths = [480, 800, 1080, 1400];

const links = {
  about: "https://studio-b.framer.website/about",
  article: "https://studio-b.framer.website/article-single",
  works: {
    artObjects: "https://studio-b.framer.website/works/art-and-objects",
    cutPaste: "https://studio-b.framer.website/works/cut-and-paste",
    dries: "https://studio-b.framer.website/works/dries-van-noten",
    faune: "https://studio-b.framer.website/works/faune",
    jacquemus: "https://studio-b.framer.website/works/jacquemus",
    maison: "https://studio-b.framer.website/works/maison-margiela",
    margot: "https://studio-b.framer.website/works/margot-glasses",
    nike: "https://studio-b.framer.website/works/nike",
    polestar: "https://studio-b.framer.website/works/polestar",
    raf: "https://studio-b.framer.website/works/raf-simons",
    rick: "https://studio-b.framer.website/works/rick-owens",
    tesla: "https://studio-b.framer.website/works/tesla-motors",
    yangLi: "https://studio-b.framer.website/works/yang-li",
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

function Pill({ action, children }: { action?: string; children: string }) {
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

function CardLink({ href, label }: { href: string; label: string }) {
  return <a className={styles.cardLink} href={href} aria-label={label} />;
}

function responsiveImageProps(src: string) {
  if (!src.startsWith("https://framerusercontent.com/")) {
    return { sizes: feedImageSizes };
  }

  const url = new URL(src);
  url.searchParams.delete("height");

  return {
    sizes: feedImageSizes,
    srcSet: responsiveImageWidths
      .map((width) => {
        url.searchParams.set("width", String(width));
        return `${url.toString()} ${width}w`;
      })
      .join(", "),
  };
}

function SimpleCard({
  action,
  href,
  label,
  title,
  size = "small",
}: {
  action?: string;
  href?: string;
  label: string;
  title: string;
  size?: "small" | "medium" | "square";
}) {
  return (
    <article className={`${styles.card} ${href ? styles.interactive : ""} ${styles.textCard} ${styles[size]}`}>
      <Pill action={action}>{label}</Pill>
      <h3 className={`${styles.title} ${label === "Services" ? styles.servicesTitle : ""}`}>{title}</h3>
      {href ? <CardLink href={href} label={`${action ?? "Open"} ${title}`} /> : null}
    </article>
  );
}

function ImageCard({
  action = "View",
  href,
  label = "Work",
  title,
  src,
  size = "square",
  position,
}: {
  action?: string;
  href?: string;
  label?: string;
  title: string;
  src: string;
  size?: "medium" | "square";
  position?: string;
}) {
  return (
    <article className={`${styles.card} ${href ? styles.interactive : ""} ${styles.imageCard} ${styles[size]}`}>
      <img
        className={`${styles.media} ${styles.softImage}`}
        src={src}
        alt=""
        loading="lazy"
        {...responsiveImageProps(src)}
        style={position ? { objectPosition: position } : undefined}
      />
      <div className={styles.overlay} />
      <Pill action={href ? action : undefined}>{label}</Pill>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {href ? <CardLink href={href} label={`${action} ${title || label}`} /> : null}
    </article>
  );
}

function VideoCard({
  action = "View",
  href,
  label = "Work",
  title,
  src,
  poster,
}: {
  action?: string;
  href?: string;
  label?: string;
  title: string;
  src: string;
  poster?: string;
}) {
  const articleRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
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
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    void video.play().catch(() => {
      // Browsers may delay autoplay until the card is painted or visible.
    });
  }, [shouldLoad]);

  return (
    <article
      ref={articleRef}
      className={`${styles.card} ${href ? styles.interactive : ""} ${styles.imageCard} ${styles.square}`}
      onFocusCapture={() => setShouldLoad(true)}
      onPointerEnter={() => setShouldLoad(true)}
    >
      <video
        ref={videoRef}
        className={styles.media}
        src={shouldLoad ? src : undefined}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload={shouldLoad ? "metadata" : "none"}
        aria-hidden="true"
      />
      <div className={styles.overlay} />
      <Pill action={href ? action : undefined}>{label}</Pill>
      <h3 className={styles.title}>{title}</h3>
      {href ? <CardLink href={href} label={`${action} ${title}`} /> : null}
    </article>
  );
}

function NewsCard({
  href,
  label,
  title,
  caption,
}: {
  href?: string;
  label: string;
  title: string;
  caption: string;
}) {
  return (
    <article className={`${styles.card} ${href ? styles.interactive : ""} ${styles.greenCard} ${styles.medium}`}>
      <Pill action={href ? "Read" : undefined}>{label}</Pill>
      <h3 className={styles.greenTitle}>{title}</h3>
      <p className={styles.caption}>{caption}</p>
      {href ? <CardLink href={href} label={`Read ${title}`} /> : null}
    </article>
  );
}

function CopyCard({
  href,
  label = "Studio",
  children,
  large = false,
}: {
  href?: string;
  label?: string;
  children: string;
  large?: boolean;
}) {
  return (
    <article className={`${styles.card} ${href ? styles.interactive : ""} ${styles.textCard} ${styles.medium}`}>
      <Pill action={href ? "About" : undefined}>{label}</Pill>
      <p className={large ? styles.bigCopy : styles.bodyCopy}>{children}</p>
      {href ? <CardLink href={href} label="About Studio B" /> : null}
    </article>
  );
}

function TimeCard() {
  const time = useLondonTime();

  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.small}`}>
      <Pill>Studio</Pill>
      <p className={styles.timeCopy}>{time} / London</p>
    </article>
  );
}

function LogosCard() {
  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.medium} ${styles.logosCard}`}>
      <Pill>Clients</Pill>
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

function AwardsCard() {
  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.small} ${styles.awards}`}>
      <Pill>Recognition</Pill>
      <h3 className={styles.title}>0 Awards</h3>
    </article>
  );
}

function SoundsCard() {
  return (
    <article className={`${styles.card} ${styles.interactive} ${styles.textCard} ${styles.square} ${styles.soundsCard}`}>
      <Pill action="Sounds">Studio</Pill>
      <h3 className={styles.soundsTitle}>What we listen in the studio</h3>
      <iframe
        className={styles.spotify}
        src="https://open.spotify.com/embed/playlist/22KovfchogcaO7CcFsIzHl?theme=1"
        title="Studio B Spotify playlist"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </article>
  );
}

function ServicesCard() {
  const text = useTypewriter(serviceWords);

  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.small}`}>
      <Pill>Services</Pill>
      <h3 className={`${styles.title} ${styles.servicesTitle}`} aria-label={`Services: ${text}`}>
        {text}
      </h3>
    </article>
  );
}

export function StudioBFeed() {
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
    <section ref={feedRef} className={styles.feed} aria-label="Studio B inspired feed">
      <div className={styles.grid}>
        <div className={styles.column}>
          <SimpleCard action="View" href={links.works.raf} label="Case Study" title="Raf Simons" />
          <NewsCard
            href={links.article}
            label="Studio Thoughts"
            title="We built a new online presence!"
            caption="Rahul Kashyap"
          />
          <ImageCard href={links.works.raf} label="Case Study" title="Avantis" src={images.avantis} />
          <CopyCard href={links.about} large>
            We are driven by concepts, dedicated to creating, expressing, and enhancing brand identities.
          </CopyCard>
          <ImageCard href={links.works.cutPaste} title="Cut and Paste" src={images.cutPaste} />
          <TimeCard />
          <VideoCard href={links.works.maison} title="Maison Margiela" src={videos.maison} poster={images.maison} />
          <ImageCard href={links.works.tesla} title="Tesla Motors" src={images.tesla} />
        </div>

        <div className={styles.column}>
          <ImageCard href={links.works.polestar} title="Bar Doubble" src={images.artObjects} position="center 48%" />
          <CopyCard href={links.about}>
            For us, everything begins with the strength of a compelling concept. Our methodology stems from transforming
            stories into unique and adaptable creations designed for growth and precision.
          </CopyCard>
          <LogosCard />
          <ImageCard href={links.works.artObjects} title="Oum Ceramics" src={images.oum} position="center center" />
          <SimpleCard action="View" href={links.works.jacquemus} label="Work" title="Jacquemus" />
          <ImageCard action="About" href={links.about} label="Studio" title="" src={images.studio} />
          <ImageCard
            href={links.works.dries}
            title="Dries Van Noten"
            src={images.dries}
            size="medium"
            position="center 44%"
          />
          <AwardsCard />
          <ImageCard href={links.works.yangLi} title="Yang Li" src={images.yangLi} size="medium" />
        </div>

        <div className={styles.column}>
          <ImageCard
            href={links.works.margot}
            title="Mira"
            src={images.mira}
            size="medium"
            position="center 54%"
          />
          <NewsCard
            href={links.article}
            label="Case Study"
            title="Talk at the Art Directors Club"
            caption="Rahul Kashyap"
          />
          <ImageCard href={links.works.faune} label="Case Study" title="Zetachain" src={images.zeta} />
          <ServicesCard />
          <NewsCard
            href={links.article}
            label="Talk"
            title="Brand Identity"
            caption="Our founders will speak at the festival conference in Spain"
          />
          <ImageCard href={links.works.rick} title="Rick Owens" src={images.rick} />
          <SimpleCard action="View" href={links.works.nike} label="Work" title="Nike" />
          <SoundsCard />
        </div>
      </div>
    </section>
  );
}
