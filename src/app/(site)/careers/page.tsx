import { createExactTitleMetadata } from "@/lib/metadata";
import CareersOpenRoles from "@/components/careers-open-roles";
import { getJobPostings, getTeamMembers } from "@/lib/content";
import styles from "./page.module.css";
import CareersMosaic from "./careers-mosaic";

type Pillar = {
  title: string;
  body: string;
  featured?: boolean;
};

const filmstripMedia = [
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
    body: "We are advancing the practice of design through careful consideration of how we work, create, and collaborate.",
  },
  {
    title: "Collective Progression",
    body: "Individual brilliance matters, but shared knowledge transforms. We are building a community of creators who elevate each other.",
    featured: true,
  },
  {
    title: "Human Ambition",
    body: "We believe in ambitious goals achieved through human centered approaches and support led growth.",
  },
  {
    title: "Strategic Craft",
    body: "A strategic deep dive for companies that need to define purpose, values, and brand narrative before building outward.",
  },
];

const trustLogos = [
  "/logos/studio-logo-1.svg",
  "/logos/studio-logo-2.svg",
  "/logos/studio-logo-3.svg",
  "/logos/studio-logo-4.svg",
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
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroTitleWrap}>
          <h1>Hello! We&apos;re Zelvin, your agency in NYC with a focus on branding, purpose, and impactful websites.</h1>
        </div>

        <div className={styles.filmstripWrap} aria-label="Showcase strip">
          <div className={styles.filmstripTrack}>
            {[0, 1].map((copy) => (
              <div key={copy} className={styles.filmstripCard}>
                {filmstripMedia.map((item, index) => (
                  <figure
                    key={`${copy}-${index}-${item.src}`}
                    className={styles[item.className as keyof typeof styles]}
                  >
                    {item.kind === "video" ? (
                      <video src={item.src} autoPlay loop muted playsInline preload="none" />
                    ) : (
                      <img src={item.src} alt={item.alt} loading="lazy" />
                    )}
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroNotes}>
          <article>
            <h3>Our mission</h3>
            <p>
              From strategy to design, every detail was handled with care and expertise. We&apos;ve already seen a
              boost in engagement and couldn&apos;t be happier with the results highly recommended for anyone looking.
            </p>
          </article>
          <article>
            <h3>Our vision</h3>
            <p>
              We&apos;ve already seen a boost in engagement and couldn&apos;t be happier with the results highly
              recommended for anyone looking.
            </p>
          </article>
          <div className={styles.trustRow}>
            <div className={styles.avatarStack} aria-hidden="true">
              {trustLogos.map((logo) => (
                <img key={logo} src={logo} alt="" loading="lazy" />
              ))}
            </div>
            <p>Trust by 50k+ clients &amp; organisations</p>
            <a href="mailto:careers@ripe.studio">Get In Touch</a>
          </div>
        </div>
      </section>

      <section className={styles.pillarsSection}>
        <h2>The pillars that Ripe is built on</h2>
        <div className={styles.pillarsGrid}>
          {pillars.map((pillar, index) => (
            <article key={`${pillar.title}-${index}`} className={pillar.featured ? styles.pillarCardFeatured : styles.pillarCard}>
              <span className={styles.pillarIcon}>*</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
        <p className={styles.pillarsStatement}>
          Work thrives when people do. We have built a place where craft and care move together, where designers grow
          without burning out, and founders find partners who treat their vision like it is their own.
        </p>
      </section>

      <section className={styles.mosaicSection}>
        <CareersMosaic />
      </section>

      <section className={styles.peopleSection}>
        <h2>Some faces you will be working with</h2>

        <div className={styles.foundersRow}>
          {founders.map((founder) => (
            <article key={founder.name} className={styles.founderCard}>
              <img src={founder.photo} alt={founder.name} loading="lazy" />
              <div>
                <h3>{founder.name}</h3>
                <p>{founder.role}</p>
              </div>
            </article>
          ))}
        </div>

        <figure className={styles.groupPhoto}>
          <img
            src="/careers-media/group-photo.jpg"
            alt="Studio team group portrait"
            loading="lazy"
          />
        </figure>

        <CareersOpenRoles roles={roles} />
      </section>
    </main>
  );
}
