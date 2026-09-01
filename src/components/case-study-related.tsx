import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

export type CaseStudyRelatedProject = {
  title: string;
  year: string;
  image: string;
  href: string;
};

export type CaseStudyAllProjectsLinkProps = {
  href?: string;
  styles: Record<string, string>;
};

export function CaseStudyAllProjectsLink({ href = "/case-studies", styles }: CaseStudyAllProjectsLinkProps) {
  return (
    <Link href={href as Route} className={styles.formaAllProjectsLink}>
      All case studies <span aria-hidden="true">&#8599;</span>
    </Link>
  );
}

export type CaseStudyRelatedProjectCardProps = {
  project: CaseStudyRelatedProject;
  styles: Record<string, string>;
};

export function CaseStudyRelatedProjectCard({ project, styles }: CaseStudyRelatedProjectCardProps) {
  return (
    <Link href={project.href as Route} className={styles.formaProjectCard}>
      <Image
        src={project.image}
        alt=""
        width={698}
        height={872}
        sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
        crossOrigin="anonymous"
        loading="lazy"
      />
      <span>{project.title}</span>
      <span>{project.year}</span>
    </Link>
  );
}

export type CaseStudyRelatedProjectsProps = {
  allHref?: string;
  projects: CaseStudyRelatedProject[];
  styles: Record<string, string>;
};

export function CaseStudyRelatedProjects({ allHref = "/case-studies", projects, styles }: CaseStudyRelatedProjectsProps) {
  return (
    <section className={styles.formaMoreProjects} aria-label="Other case studies">
      <div className={styles.formaMoreHeader}>
        <h2>Other Case Studies</h2>
        <CaseStudyAllProjectsLink href={allHref} styles={styles} />
      </div>
      <div className={styles.formaProjectGrid}>
        {projects.map((project) => (
          <CaseStudyRelatedProjectCard key={`${project.title}-${project.year}`} project={project} styles={styles} />
        ))}
      </div>
    </section>
  );
}
