import { createExactTitleMetadata } from "@/lib/metadata";
import styles from "./page.module.css";
import CareersMosaic from "./careers-mosaic";

type Pillar = {
  title: string;
  body: string;
  featured?: boolean;
};

type Role = {
  title: string;
  commitment: string;
  mode: string;
};

const filmstripMedia = [
  {
    kind: "image" as const,
    className: "frameWide",
    src: "https://framerusercontent.com/images/0uYYwg4l5TY9BEyVeJEXDz5tImw.jpeg",
    alt: "Filmstrip frame one",
  },
  {
    kind: "image" as const,
    className: "frameTall",
    src: "https://framerusercontent.com/images/cES5Gh7X59Uy7dJCWMtC4IpBg.jpeg?scale-down-to=1024",
    alt: "Filmstrip frame two",
  },
  {
    kind: "video" as const,
    className: "frameWide",
    src: "https://framerusercontent.com/assets/cDCCFF66pO8EHGxFXIzo4l3wBU.mp4",
    alt: "Filmstrip motion frame",
  },
  {
    kind: "image" as const,
    className: "frameSquare",
    src: "https://framerusercontent.com/images/yhyOWviPLkr2WrX0EQdNiczqkqA.jpeg?scale-down-to=1024",
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

const founders = [
  {
    name: "Rahul Kashyap",
    role: "Founder, CEO",
    photo:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sachin Bhatt",
    role: "Creative Director",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
];

const roles: Role[] = [
  { title: "Brand Designer", commitment: "Contract", mode: "FTE" },
  { title: "Web Designer", commitment: "Contract", mode: "FTE" },
  { title: "Motion Designer", commitment: "Contract", mode: "Remote" },
  { title: "Accountant", commitment: "Full Time", mode: "Remote" },
];

export async function generateMetadata() {
  return createExactTitleMetadata({
    title: "Careers",
    path: "/careers",
  });
}

export default function CareersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroTitleWrap}>
          <h1>Hello! We&apos;re Zelvin, your agency in NYC with a focus on branding, purpose, and impactful websites.</h1>
          <span className={styles.heroPill}>our story</span>
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
              <img
                src="https://framerusercontent.com/images/gs1x8JrxseuqS7uJ4pK7s8lzs.jpg?width=400&height=400"
                alt=""
                loading="lazy"
              />
              <img
                src="https://framerusercontent.com/images/JPcQKZLJYrN43bpXiM9I37IK4E.jpg?width=400&height=400"
                alt=""
                loading="lazy"
              />
              <img
                src="https://framerusercontent.com/images/ojDJ2tp6DExX90gk5XwoaGDCutc.jpg?width=400&height=400"
                alt=""
                loading="lazy"
              />
              <img
                src="https://framerusercontent.com/images/PdCMf04RmRPAbpHAoPA1mSLM.jpg?width=400&height=400"
                alt=""
                loading="lazy"
              />
            </div>
            <p>
              Trust by <strong>50k+ clients</strong> &amp; organisations
            </p>
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
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
            alt="Studio team group portrait"
            loading="lazy"
          />
        </figure>

        <div className={styles.rolesBlock}>
          <div className={styles.rolesCopy}>
            <p>
              All our roles are remote and flexible, keeping with our studio policy.
            </p>
            <p>Aliqua quis magna eu ipsum consectetur. Esse cupidatat consectetur do sint esse aliquip.</p><br/>
            <p>
              If you don&apos;t see a open role here that fits you, but you still think you&apos;d be a good fit at Ripe,
              feel free to drop a line at <a href="mailto:careers@ripe.studio">careers@ripe.studio</a>!
            </p><br/>
            <p>
              We&apos;re always on the lookout for talent, and if we find the right people, we will make it work for
              you!
            </p>
          </div>

          <div className={styles.rolesListWrap} id="open-roles">
            <h3>Open Roles</h3>
            <ul>
              {roles.map((role) => (
                <li key={role.title}>
                  <span>{role.title}</span>
                  <small>{role.commitment}</small>
                  <small>{role.mode}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
