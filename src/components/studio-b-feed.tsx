"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./studio-b-feed.module.css";

const images = {
  maison: "https://framerusercontent.com/images/PJ4eIw910N92PRbWoU7G8dQpCSQ.jpg",
  cutPaste: "https://framerusercontent.com/images/TDVqw1tqR6Xs2CRjqnICnaPpH1o.jpg",
  tesla: "https://framerusercontent.com/images/1tWZIqC7cLcjzMvm9KUZIoIEH0.jpeg",
  polestar: "https://framerusercontent.com/images/Tlpib4CyrbdqyderduT9vzAadsc.jpg",
  artObjects: "https://framerusercontent.com/images/9iUqmRc0mCszgnoIcbHNK758gck.jpg",
  studio: "https://framerusercontent.com/images/YJ7KrAOMijDmR3aacD3lI8YfOC4.jpg?width=1280&height=853",
  dries: "https://framerusercontent.com/images/nwabeIJBn9YTGH9qZPPHlf13mM.jpg",
  yangLi: "https://framerusercontent.com/images/ez21OQNZzW1WsIvb3E0iXlwNw8.jpg",
  margot: "https://framerusercontent.com/images/5w8O1Tx5e1JaHayg8lfISv2Mw.jpg",
  faune: "https://framerusercontent.com/images/hWuHSaij56zc0oBboEog12rtI.jpg",
  rick: "https://framerusercontent.com/images/nKHExlWmSBMLnqfZuSBVnUtNPPw.jpg",
};

const videos = {
  maison: "https://ena-supply.b-cdn.net/Studio%20B/cottenbro%20(1).mp4",
  polestar: "https://ena-supply.b-cdn.net/Studio%20B/pexels-yaroslav-shuraev-5418124%20trim%20(1).mp4",
};

const serviceWords = ["Strategy", "Identity", "Design", "Motion"];

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
  const [time, setTime] = useState(londonTime);

  useEffect(() => {
    const interval = window.setInterval(() => setTime(londonTime()), 1000);
    return () => window.clearInterval(interval);
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

function Pill({ children }: { children: string }) {
  return <span className={styles.pill}>{children}</span>;
}

function SimpleCard({
  label,
  title,
  size = "small",
}: {
  label: string;
  title: string;
  size?: "small" | "medium" | "square";
}) {
  return (
    <article className={`${styles.card} ${styles.textCard} ${styles[size]}`}>
      <Pill>{label}</Pill>
      <h3 className={`${styles.title} ${label === "Services" ? styles.servicesTitle : ""}`}>{title}</h3>
    </article>
  );
}

function ImageCard({
  label = "Work",
  title,
  src,
  size = "square",
  position,
}: {
  label?: string;
  title: string;
  src: string;
  size?: "medium" | "square";
  position?: string;
}) {
  return (
    <article className={`${styles.card} ${styles.imageCard} ${styles[size]}`}>
      <img
        className={`${styles.media} ${styles.softImage}`}
        src={src}
        alt=""
        loading="eager"
        style={position ? { objectPosition: position } : undefined}
      />
      <div className={styles.overlay} />
      <Pill>{label}</Pill>
      <h3 className={styles.title}>{title}</h3>
    </article>
  );
}

function VideoCard({
  label = "Work",
  title,
  src,
  poster,
}: {
  label?: string;
  title: string;
  src: string;
  poster?: string;
}) {
  return (
    <article className={`${styles.card} ${styles.imageCard} ${styles.square}`}>
      <video
        className={styles.media}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className={styles.overlay} />
      <Pill>{label}</Pill>
      <h3 className={styles.title}>{title}</h3>
    </article>
  );
}

function NewsCard({
  label,
  title,
  caption,
}: {
  label: string;
  title: string;
  caption: string;
}) {
  return (
    <article className={`${styles.card} ${styles.greenCard} ${styles.medium}`}>
      <Pill>{label}</Pill>
      <h3 className={styles.greenTitle}>{title}</h3>
      <p className={styles.caption}>{caption}</p>
    </article>
  );
}

function CopyCard({
  label = "Studio",
  children,
  large = false,
}: {
  label?: string;
  children: string;
  large?: boolean;
}) {
  return (
    <article className={`${styles.card} ${styles.textCard} ${styles.medium}`}>
      <Pill>{label}</Pill>
      <p className={large ? styles.bigCopy : styles.bodyCopy}>{children}</p>
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
    <article className={`${styles.card} ${styles.textCard} ${styles.medium}`}>
      <Pill>Clients</Pill>
      <div className={styles.logos} aria-hidden="true">
        <div className={styles.logoTrack}>
          <span>ena</span>
          <span>Sensa</span>
          <span>FILIPPE MONET</span>
          <span>APEX I</span>
          <span>ena</span>
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
    <article className={`${styles.card} ${styles.textCard} ${styles.square}`}>
      <Pill>Studio</Pill>
      <h3 className={styles.soundsTitle}>What we listen in the studio</h3>
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
          <SimpleCard label="Work" title="Raf Simons" />
          <NewsCard
            label="Feature"
            title="We built a new online presence"
            caption="7 projects selected for the AKQA 10 Year Book"
          />
          <VideoCard title="Maison Margiela" src={videos.maison} poster={images.maison} />
          <CopyCard large>
            We are driven by concepts, dedicated to creating, expressing, and enhancing brand identities.
          </CopyCard>
          <ImageCard title="Cut and Paste" src={images.cutPaste} />
          <TimeCard />
          <NewsCard
            label="Interview"
            title="We spoke to The Brand Identity"
            caption="All about Studio life and how we approach projects"
          />
          <ImageCard title="Tesla Motors" src={images.tesla} />
        </div>

        <div className={styles.column}>
          <VideoCard title="Polestar" src={videos.polestar} poster={images.polestar} />
          <CopyCard>
            For us, everything begins with the strength of a compelling concept. Our methodology stems from transforming
            stories into unique and adaptable creations designed for growth and precision.
          </CopyCard>
          <ImageCard title="Art and Objects" src={images.artObjects} />
          <SimpleCard label="Work" title="Jacquemus" />
          <ImageCard label="Studio" title="" src={images.studio} />
          <ImageCard title="Dries Van Noten" src={images.dries} size="medium" position="center 44%" />
          <AwardsCard />
          <ImageCard title="Yang Li" src={images.yangLi} size="medium" />
        </div>

        <div className={styles.column}>
          <ImageCard title="Margot Glasses" src={images.margot} size="medium" position="center 54%" />
          <NewsCard
            label="Talk"
            title="Talk at the Art Directors Club"
            caption="Our founders will speak at the festival conference in Spain"
          />
          <LogosCard />
          <ImageCard title="Faune" src={images.faune} />
          <ServicesCard />
          <ImageCard title="Rick Owens" src={images.rick} />
          <SimpleCard label="Work" title="Nike" />
          <SoundsCard />
        </div>
      </div>
    </section>
  );
}
