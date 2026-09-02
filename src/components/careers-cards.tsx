import typeStyles from "@/styles/careers-typography.module.css";

export type CareersBenefitCardVariant = "books" | "referral" | "headspace" | "flexible" | "offsite" | "commission" | "learning" | "wework" | "home-office";
export type CareersBenefitCardProps = { children: React.ReactNode; styles: Record<string, string>; variant: CareersBenefitCardVariant };

const benefitClassNames: Record<CareersBenefitCardVariant, string> = {
  books: "booksCard",
  referral: "referralCard",
  headspace: "headspaceCard",
  flexible: "flexibleCard",
  offsite: "offsiteCard",
  commission: "commissionCard",
  learning: "learningCard",
  wework: "weworkCard",
  "home-office": "homeOfficeCard",
};

export function CareersBenefitCard({ children, styles, variant }: CareersBenefitCardProps) {
  return <article className={`${styles.card} ${styles[benefitClassNames[variant]]}`}>{children}</article>;
}

export type CareersPillarCardProps = { activeLayer?: boolean; body: string; styles: Record<string, string>; title: string };

export function CareersPillarCard({ activeLayer = false, body, styles, title }: CareersPillarCardProps) {
  return (
    <article className={styles.pillarCard}>
      <div className={styles.pillarCardHeader}>
        <img className={styles.pillarIcon} src="/careers-media/Icon (1).svg" alt="" aria-hidden="true" />
        <h3 className={typeStyles.h1} data-careers-reveal={activeLayer ? undefined : ""}>{title}</h3>
      </div>
      <p className={typeStyles.h3} data-careers-reveal={activeLayer ? undefined : ""} data-careers-reveal-delay={activeLayer ? undefined : "1"}>{body}</p>
    </article>
  );
}

export type CareersFounderCardProps = { name: string; photo: string; role: string; styles: Record<string, string> };

export function CareersFounderCard({ name, photo, role, styles }: CareersFounderCardProps) {
  return (
    <article className={styles.founderCard}>
      <img src={photo} alt={name} loading="lazy" />
      <div data-careers-reveal>
        <h3 className={typeStyles.h2}>{name}</h3>
        <p className={typeStyles.h4}>{role}</p>
      </div>
    </article>
  );
}

export type CareersFilmstripItem = {
  alt: string;
  className: "frameWide" | "frameTall" | "frameSquare";
  kind: "image" | "video";
  src: string;
};

export type CareersFilmstripCardProps = { copy: number; items: CareersFilmstripItem[]; styles: Record<string, string> };

export function CareersFilmstripCard({ copy, items, styles }: CareersFilmstripCardProps) {
  return (
    <div className={styles.filmstripCard}>
      {items.map((item, index) => (
        <figure
          key={`${copy}-${index}-${item.src}`}
          className={styles[item.className]}
          data-filmstrip-frame
          style={{ "--filmstrip-frame-index": index } as React.CSSProperties}
        >
          {item.kind === "video" ? <video src={item.src} autoPlay loop muted playsInline preload="none" /> : <img src={item.src} alt={item.alt} loading="lazy" />}
        </figure>
      ))}
    </div>
  );
}

const learningLogos = [
  { src: "/careers-media/Masterclass.svg", alt: "MasterClass", className: "masterclassLogo" },
  { src: "/careers-media/Skillshare.svg", alt: "Skillshare", className: "skillshareLogo" },
  { src: "/careers-media/Coursera.svg", alt: "Coursera", className: "courseraLogo" },
];

function CareersLearningLogoRow({ duplicate = false, styles }: { duplicate?: boolean; styles: Record<string, string> }) {
  return <div className={styles.learningLogoRow} aria-hidden={duplicate || undefined}>{learningLogos.map((logo) => <img key={logo.src} src={logo.src} alt={duplicate ? "" : logo.alt} className={styles[logo.className]} />)}</div>;
}

export type CareersBenefitsProps = { styles: Record<string, string> };

export function CareersBenefits({ styles }: CareersBenefitsProps) {
  return (
    <div className={styles.wrap} aria-label="Benefits of working at Ripe">
      <div className={styles.column}>
        <CareersBenefitCard styles={styles} variant="books"><img src="/careers-media/unsplash_JlNJEAUBa1E.png" alt="" /><h3 className={typeStyles.h2} data-careers-reveal>Reimbursements<br />on Books</h3></CareersBenefitCard>
        <CareersBenefitCard styles={styles} variant="referral"><h3 className={typeStyles.h2} data-careers-reveal>Earn referral commissions for team members you help us hire.</h3><p className={typeStyles.h4} data-careers-reveal data-careers-reveal-delay="1">Designer Referrals</p></CareersBenefitCard>
        <CareersBenefitCard styles={styles} variant="headspace"><img src="/careers-media/Headspace.png" alt="" /><h3 className={typeStyles.h2} data-careers-reveal>Annual Headspace Subscription</h3></CareersBenefitCard>
      </div>
      <div className={styles.column}>
        <CareersBenefitCard styles={styles} variant="flexible"><h3 className={typeStyles.h2} data-careers-reveal>Work when you want,<br />just own your tasks.</h3><p className={typeStyles.h4} data-careers-reveal data-careers-reveal-delay="1">Flexible Work Hours</p></CareersBenefitCard>
        <CareersBenefitCard styles={styles} variant="offsite"><img src="/careers-media/Group 2.png" alt="" /><h3 className={typeStyles.h2} data-careers-reveal>Yearly, all expenses<br />paid offsite.</h3><p className={typeStyles.h4} data-careers-reveal data-careers-reveal-delay="1">Offsites</p></CareersBenefitCard>
        <CareersBenefitCard styles={styles} variant="commission"><h3 className={typeStyles.h2} data-careers-reveal>We give you commissions<br />for bringing in projects,<br />starting from 7%</h3><p className={typeStyles.h4} data-careers-reveal data-careers-reveal-delay="1">Project Referrals</p></CareersBenefitCard>
      </div>
      <div className={styles.column}>
        <CareersBenefitCard styles={styles} variant="learning"><p className={typeStyles.h4} data-careers-reveal>Subscriptions to Learn</p><div className={styles.learningCarousel}><div className={styles.learningTrack}><CareersLearningLogoRow styles={styles} /><CareersLearningLogoRow duplicate styles={styles} /></div></div></CareersBenefitCard>
        <CareersBenefitCard styles={styles} variant="wework"><img src="/careers-media/unsplash_ZFy_KeVv8vE.png" alt="" /><h3 className={typeStyles.h2} data-careers-reveal>WeWork Passes</h3></CareersBenefitCard>
        <CareersBenefitCard styles={styles} variant="home-office"><img src="/careers-media/unsplash_otfbs6vO4N8.png" alt="" /><p className={typeStyles.h4} data-careers-reveal>Home Office Allowances</p></CareersBenefitCard>
      </div>
    </div>
  );
}
