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

const projectDetail = {
  title: "Ripe Systems",
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
  { title: "Frame Signal", year: "2025", image: projectDetail.images.moreOne },
  { title: "Arclight", year: "2025", image: projectDetail.images.moreTwo },
  { title: "Core Motion", year: "2024", image: projectDetail.images.moreThree },
  { title: "Studio Frame", year: "2024", image: projectDetail.images.moreFour },
];

export async function generateStaticParams() {
  const slugs = Array.from(new Set([...(await getCaseStudySlugs()), ...workJournalItems.map((item) => item.slug)]));
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata() {
  return createExactTitleMetadata({
    title: "Ripe Systems | Ripe Studios",
    description: projectDetail.eyebrow,
    path: "/case-studies/zetachain",
  });
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;

  if (!validSlugs.has(slug) && !(await getCaseStudySlugs()).includes(slug)) {
    notFound();
  }

  return (
    <main className={styles.projectPage}>
      <ProjectChrome />

      <section className={styles.projectHero}>
        <img
          className={styles.projectHeroImage}
          src={projectDetail.images.hero}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.projectHeroCopy}>
          <p>{projectDetail.eyebrow}</p>
          <h1>{projectDetail.title}</h1>
          <span>Scroll to view more</span>
        </div>
      </section>

      <section className={styles.projectInfo} aria-label="Project information">
        <div className={styles.projectFacts}>
          <ProjectFact label="Services">
            {projectDetail.services.join(", ")}
          </ProjectFact>
          <ProjectFact label="Industry">{projectDetail.industry}</ProjectFact>
          <ProjectFact label="Year">{projectDetail.year}</ProjectFact>
        </div>
        <div className={styles.projectInformation}>
          <p className={styles.projectLabel}>(Information)</p>
          {projectDetail.information.map((paragraph) => (
            <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
      </section>

      <section className={styles.projectIntroMedia} aria-label="Project imagery">
        <img src={projectDetail.images.intro} alt="" loading="eager" decoding="async" />
      </section>

      <section className={styles.projectCarousel} aria-label="Campaign carousel">
        <div className={styles.projectCarouselPanel}>
          <button className={styles.projectArrow} aria-label="Previous project image">
            &#8592;
          </button>
          <img src={projectDetail.images.carouselOne} alt="" loading="lazy" decoding="async" />
          <button className={`${styles.projectArrow} ${styles.projectArrowNext}`} aria-label="Next project image">
            &#8594;
          </button>
          <div className={styles.projectDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className={styles.projectCarouselPoster}>
          <img src={projectDetail.images.carouselTwo} alt="" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className={styles.projectBlackFeature} aria-label="Feature spread">
        <video src={projectDetail.images.blackFeature} autoPlay muted loop playsInline preload="auto" />
      </section>

      <section className={styles.projectWideFeature} aria-label="Wide feature">
        <img src={projectDetail.images.wideFeature} alt="" loading="lazy" decoding="async" />
      </section>

      <section className={styles.projectMoreProjects} aria-label="More projects">
        <div className={styles.projectMoreHeader}>
          <h2>More Projects</h2>
          <Link href="/case-studies">
            All projects <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
        <div className={styles.projectProjectGrid}>
          {moreProjects.map((project) => (
            <Link href="/case-studies/zetachain" className={styles.projectProjectCard} key={project.title}>
              <img src={project.image} alt="" loading="lazy" decoding="async" />
              <span>{project.title}</span>
              <span>{project.year}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.projectCta} aria-label="Contact">
        <img src={projectDetail.images.cta} alt="" loading="lazy" decoding="async" />
        <div className={styles.projectCtaCopy}>
          <h2>
            LET&rsquo;S CREATE
            <br />
            SOMETHING TOGETHER
          </h2>
          <a href="mailto:hello@ripestudios.com">
            Get in touch <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </section>

      <footer className={styles.projectFooter}>
        <Link href="/">Ripe Studios</Link>
        <nav aria-label="Footer">
          <a href="/terms">Terms &amp; Conditions</a>
          <Link href="/team">Team</Link>
          <Link href="/work-new">Work</Link>
        </nav>
      </footer>

      <div className={styles.projectBadges} aria-hidden="true">
        <span>Case Study</span>
        <span>Ripe Studios</span>
      </div>
    </main>
  );
}

function ProjectChrome() {
  return (
    <header className={styles.projectChrome}>
      <Link className={styles.projectBrand} href="/">
        Ripe Studios
      </Link>
      <nav className={styles.projectNav} aria-label="Main">
        <Link href="/work-new">Projects</Link>
        <Link href="/team">About</Link>
        <Link href="/writing">Journal</Link>
        <Link href="/careers">Careers</Link>
      </nav>
      <a className={styles.projectContact} href="mailto:hello@ripestudios.com">
        <span aria-hidden="true">&#8599;</span> Get in touch
      </a>
    </header>
  );
}

function ProjectFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.projectFact}>
      <p>({label})</p>
      <strong>{children}</strong>
    </div>
  );
}
