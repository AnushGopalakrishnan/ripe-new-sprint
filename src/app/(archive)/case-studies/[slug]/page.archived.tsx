import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCaseStudySlugs } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";
import { workJournalItems } from "@/data/work-journal";
import styles from "@/app/(site)/detail-page.module.css";

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

const validSlugs = new Set([...workJournalItems.map((item) => item.slug)]);

const reference = {
  title: "Polestar",
  eyebrow: "A bold vision cast in futuristic steel and shade.",
  services: ["Art Direction", "Campaign Design"],
  industry: "Automotive",
  year: "2025",
  information: [
    'In this project, we were approached by a startup called "Green Wave" to develop a brand identity that reflected their commitment to sustainability',
    "The client's goal was to create a brand identity that would resonate with environmentally conscious consumers and help position Green Wave as a leader in the market.",
    "Our approach was to create a brand identity that communicated Green Wave's values of sustainability, innovation, and authenticity. We used a palette of earthy greens and soft blues, evoking the natural world and the company&rsquo;s eco-friendly focus. Typography was kept clean and modern to reflect innovation and trustworthiness.",
  ],
  images: {
    hero: "/case-detail-media/hero.jpg",
    intro: "/case-detail-media/intro.jpg",
    carouselOne: "/case-detail-media/carousel-one.jpg",
    carouselTwo: "/case-detail-media/carousel-two.jpg",
    blackFeature: "/case-detail-media/feature.mp4#t=2",
    wideFeature: "/case-detail-media/wide-feature.jpg",
    moreOne: "/case-detail-media/more-one.jpg",
    moreTwo: "/case-detail-media/more-two.jpg",
    moreThree: "/case-detail-media/carousel-one.jpg",
    moreFour: "/case-detail-media/more-four.jpg",
    cta: "/case-detail-media/cta.jpg",
  },
};

const moreProjects = [
  { title: "Frame Signal", year: "2025", image: reference.images.moreOne },
  { title: "Arclight", year: "2025", image: reference.images.moreTwo },
  { title: "Core Motion", year: "2024", image: reference.images.moreThree },
  { title: "Studio Frame", year: "2024", image: reference.images.moreFour },
];

export async function generateStaticParams() {
  const slugs = Array.from(new Set([...(await getCaseStudySlugs()), ...workJournalItems.map((item) => item.slug)]));
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata() {
  return createExactTitleMetadata({
    title: "Polestar - Forma",
    description: reference.eyebrow,
    path: "/case-studies/zetachain",
  });
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;

  if (!validSlugs.has(slug) && !(await getCaseStudySlugs()).includes(slug)) {
    notFound();
  }

  return (
    <main className={styles.formaPage}>
      <FormaChrome />

      <section className={styles.formaHero}>
        <img
          className={styles.formaHeroImage}
          src={reference.images.hero}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.formaHeroCopy}>
          <p>{reference.eyebrow}</p>
          <h1>{reference.title}</h1>
          <span>Scroll to view more</span>
        </div>
      </section>

      <section className={styles.formaInfo} aria-label="Project information">
        <div className={styles.formaFacts}>
          <FormaFact label="Services">
            {reference.services.join(", ")}
          </FormaFact>
          <FormaFact label="Industry">{reference.industry}</FormaFact>
          <FormaFact label="Year">{reference.year}</FormaFact>
        </div>
        <div className={styles.formaInformation}>
          <p className={styles.formaLabel}>(Information)</p>
          {reference.information.map((paragraph) => (
            <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
      </section>

      <section className={styles.formaIntroMedia} aria-label="Polestar imagery">
        <img src={reference.images.intro} alt="" loading="eager" decoding="async" />
      </section>

      <section className={styles.formaCarousel} aria-label="Campaign carousel">
        <div className={styles.formaCarouselPanel}>
          <button className={styles.formaArrow} aria-label="Previous project image">
            &#8592;
          </button>
          <img src={reference.images.carouselOne} alt="" loading="lazy" decoding="async" />
          <button className={`${styles.formaArrow} ${styles.formaArrowNext}`} aria-label="Next project image">
            &#8594;
          </button>
          <div className={styles.formaDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className={styles.formaCarouselPoster}>
          <img src={reference.images.carouselTwo} alt="" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className={styles.formaBlackFeature} aria-label="Feature spread">
        <video src={reference.images.blackFeature} autoPlay muted loop playsInline preload="auto" />
      </section>

      <section className={styles.formaWideFeature} aria-label="Wide feature">
        <img src={reference.images.wideFeature} alt="" loading="lazy" decoding="async" />
      </section>

      <section className={styles.formaMoreProjects} aria-label="More projects">
        <div className={styles.formaMoreHeader}>
          <h2>More Projects</h2>
          <Link href="/case-studies">
            All projects <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
        <div className={styles.formaProjectGrid}>
          {moreProjects.map((project) => (
            <Link href="/case-studies/zetachain" className={styles.formaProjectCard} key={project.title}>
              <img src={project.image} alt="" loading="lazy" decoding="async" />
              <span>{project.title}</span>
              <span>{project.year}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.formaCta} aria-label="Contact">
        <img src={reference.images.cta} alt="" loading="lazy" decoding="async" />
        <div className={styles.formaCtaCopy}>
          <h2>
            LET&rsquo;S CREATE
            <br />
            SOMETHING TOGETHER
          </h2>
          <a href="mailto:hello@forma.agency">
            Get in touch <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </section>

      <footer className={styles.formaFooter}>
        <Link href="/">Forma&trade;</Link>
        <nav aria-label="Footer">
          <a href="/terms">Terms &amp; Conditions</a>
          <a href="https://ena.supply">Made by ena</a>
          <a href="https://www.arque.co">Images by Arq&eacute;</a>
        </nav>
      </footer>

      <div className={styles.formaBadges} aria-hidden="true">
        <span>Buy Template</span>
        <span>Made in Framer</span>
      </div>
    </main>
  );
}

function FormaChrome() {
  return (
    <header className={styles.formaChrome}>
      <Link className={styles.formaBrand} href="/">
        Forma&trade;
      </Link>
      <nav className={styles.formaNav} aria-label="Main">
        <a href="/works">Projects</a>
        <a href="/about">About</a>
        <a href="/journal">Journal</a>
        <a href="/careers">Careers</a>
      </nav>
      <a className={styles.formaContact} href="mailto:hello@forma.agency">
        <span aria-hidden="true">&#8599;</span> Get in touch
      </a>
    </header>
  );
}

function FormaFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.formaFact}>
      <p>({label})</p>
      <strong>{children}</strong>
    </div>
  );
}
