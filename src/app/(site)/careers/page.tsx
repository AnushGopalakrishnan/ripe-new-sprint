import { createExactTitleMetadata } from "@/lib/metadata";
import { CareersOpenRolesSection } from "@/components/careers-open-roles";
import { ContactCta } from "@/components/contact-cta";
import { CareersFilmstripCard, CareersFounderCard } from "@/components/careers-cards";
import { CareersPillarsGrid } from "@/components/careers-pillars-grid";
import { CareersTrustLogos } from "@/components/careers-trust-logos";
import type { CareersFilmstripItem } from "@/components/careers-cards";
import { getJobPostings, getTeamMembers } from "@/lib/content";
import styles from "./page.module.css";
import CareersMosaic from "./careers-mosaic";
import CareersTextMotion from "./careers-text-motion";
import typeStyles from "@/styles/careers-typography.module.css";

type Pillar = {
  title: string;
  body: string;
};

const filmstripMedia: CareersFilmstripItem[] = [
  {
    kind: "image" as const,
    className: "frameWide",
    src: "/careers-media/filmstrip-1.jpeg",
    alt: "Filmstrip frame one",
  },
  {
    kind: "image" as const,
    className: "frameTall",
    src: "/careers-media/filmstrip-2.jpeg",
    alt: "Filmstrip frame two",
  },
  {
    kind: "video" as const,
    className: "frameWide",
    src: "/careers-media/filmstrip-motion.mp4",
    alt: "Filmstrip motion frame",
  },
  {
    kind: "image" as const,
    className: "frameSquare",
    src: "/careers-media/filmstrip-4.jpeg",
    alt: "Filmstrip frame four",
  },
];

const pillars: Pillar[] = [
  {
    title: "Collective Progression",
    body: "Individual brilliance matters, but shared knowledge transforms. We are building a community of creators who elevate each other.",
  },
  {
    title: "Strategic Craft",
    body: "A strategic deep dive for companies that need to define purpose, values, and brand narrative before building outward.",
  },
  {
    title: "Human Ambition",
    body: "We believe in ambitious goals achieved through human centered approaches and support led growth.",
  },
];

const trustLogos = [
  "/logos/trust-logo-1.svg",
  "/logos/trust-logo-2.svg",
  "/logos/trust-logo-3.svg",
  "/logos/trust-logo-4.svg",
];

const fallbackFounders = [
  {
    name: "Rahul Kashyap",
    role: "Founder, CEO",
    photo:
      "/team-media/fallback-founder-rahul.jpg",
  },
  {
    name: "Sachin Bhatt",
    role: "Creative Director",
    photo:
      "/team-media/fallback-founder-sachin.jpg",
  },
];

export async function generateMetadata() {
  return createExactTitleMetadata({
    title: "Careers",
    path: "/careers",
  });
}

export default async function CareersPage() {
  const [roles, members] = await Promise.all([getJobPostings(), getTeamMembers()]);
  const leadershipFounders = members
    .filter((member) => member.group?.trim().toLowerCase() === "leadership")
    .filter((member) => Boolean(member.avatar?.src))
    .slice(0, 2)
    .map((member) => ({
      name: member.name,
      role: member.role || "Leadership",
      photo: member.avatar?.src || "",
    }));
  const founders = [...leadershipFounders, ...fallbackFounders].slice(0, 2);

  return (
    <main className={`${styles.page} ${typeStyles.scope}`} data-careers-page>
      <CareersTextMotion />
      <section className={styles.heroSection}>
        <div className={styles.heroViewport}>
          <div className={styles.heroTitleWrap}>
            <h1>
              A brand design studio where everyone&apos;s success feels personal. We exist to support ambitious designers
              and founders building brands worth believing in.
            </h1>
          </div>

          <div className={styles.filmstripWrap} aria-label="Showcase strip">
            <div className={styles.filmstripTrack}>
              {[0, 1].map((copy) => (
                <CareersFilmstripCard copy={copy} items={filmstripMedia} key={copy} styles={styles} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroNotes}>
          <article data-careers-reveal>
            <h3 className={typeStyles.h1}>Our mission</h3>
            <p>
              From strategy to design, every detail was handled with care and expertise. We&apos;ve already seen a
              boost in engagement and couldn&apos;t be happier with the results highly recommended for anyone looking.
            </p>
          </article>
          <article data-careers-reveal data-careers-reveal-delay="1">
            <h3 className={typeStyles.h1}>Our vision</h3>
            <p>
              We&apos;ve already seen a boost in engagement and couldn&apos;t be happier with the results highly
              recommended for anyone looking.
            </p>
          </article>
          <div className={styles.trustRow}>
            <CareersTrustLogos logos={trustLogos} styles={styles} />
            <p data-careers-reveal data-careers-reveal-delay="1">
              Trust by 50k+ clients &amp; organisations
            </p>
            <ContactCta email="careers@ripe.studio" reveal revealDelay={2} />
          </div>
        </div>
      </section>

      <section className={styles.pillarsSection}>
        <h2 className={typeStyles.h1} data-careers-reveal>The pillars that Ripe is built on</h2>
        <CareersPillarsGrid pillars={pillars} styles={styles} />
      </section>

      <section className={styles.mosaicSection}>
        <p className={`${styles.pillarsStatement} ${typeStyles.h1}`} data-careers-reveal>
          Work thrives when people do. We have built a place where craft and care move together, where designers grow
          without burning out, and founders find partners who treat their vision like it is their own.
        </p>
        <CareersMosaic />
      </section>

      <section className={styles.peopleSection}>
        <h2 className={typeStyles.h1} data-careers-reveal>Some faces you will be working with</h2>

        <div className={styles.foundersRow}>
          {founders.map((founder) => (
            <CareersFounderCard key={founder.name} styles={styles} {...founder} />
          ))}
        </div>

        <figure className={styles.groupPhoto}>
          <img
            src="/careers-media/group-photo.jpg"
            alt="Studio team group portrait"
            loading="lazy"
          />
        </figure>

      </section>

      <CareersOpenRolesSection roles={roles} />
    </main>
  );
}
