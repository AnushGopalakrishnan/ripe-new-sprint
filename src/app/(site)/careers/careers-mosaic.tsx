import styles from "./careers-mosaic.module.css";

const learningLogos = [
  {
    src: "/careers-media/Masterclass.svg",
    alt: "MasterClass",
    className: "masterclassLogo",
  },
  {
    src: "/careers-media/Skillshare.svg",
    alt: "Skillshare",
    className: "skillshareLogo",
  },
  {
    src: "/careers-media/Coursera.svg",
    alt: "Coursera",
    className: "courseraLogo",
  },
];

function LearningLogoRow({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className={styles.learningLogoRow}
      aria-hidden={duplicate || undefined}
    >
      {learningLogos.map((logo) => (
        <img
          key={logo.src}
          src={logo.src}
          alt={duplicate ? "" : logo.alt}
          className={styles[logo.className as keyof typeof styles]}
        />
      ))}
    </div>
  );
}

export default function CareersMosaic() {
  return (
    <div className={styles.wrap} aria-label="Benefits of working at Ripe">
      <div className={styles.column}>
        <article className={`${styles.card} ${styles.booksCard}`}>
          <img src="/careers-media/unsplash_JlNJEAUBa1E.png" alt="" />
          <h3 data-careers-reveal>
            Reimbursements
            <br />
            on Books
          </h3>
        </article>

        <article className={`${styles.card} ${styles.referralCard}`}>
          <h3 data-careers-reveal>Earn referral commissions for team members you help us hire.</h3>
          <p data-careers-reveal data-careers-reveal-delay="1">Designer Referrals</p>
        </article>

        <article className={`${styles.card} ${styles.headspaceCard}`}>
          <img src="/careers-media/Headspace.png" alt="" />
          <h3 data-careers-reveal>Annual Headspace Subscription</h3>
        </article>
      </div>

      <div className={styles.column}>
        <article className={`${styles.card} ${styles.flexibleCard}`}>
          <h3 data-careers-reveal>
            Work when you want,
            <br />
            just own your tasks.
          </h3>
          <p data-careers-reveal data-careers-reveal-delay="1">Flexible Work Hours</p>
        </article>

        <article className={`${styles.card} ${styles.offsiteCard}`}>
          <img src="/careers-media/Group 2.png" alt="" />
          <h3 data-careers-reveal>
            Yearly, all expenses
            <br />
            paid offsite.
          </h3>
          <p data-careers-reveal data-careers-reveal-delay="1">Offsites</p>
        </article>

        <article className={`${styles.card} ${styles.commissionCard}`}>
          <h3 data-careers-reveal>
            We give you commissions
            <br />
            for bringing in projects,
            <br />
            starting from 7%
          </h3>
          <p data-careers-reveal data-careers-reveal-delay="1">Project Referrals</p>
        </article>
      </div>

      <div className={styles.column}>
        <article className={`${styles.card} ${styles.learningCard}`}>
          <p data-careers-reveal>Subscriptions to Learn</p>
          <div className={styles.learningCarousel}>
            <div className={styles.learningTrack}>
              <LearningLogoRow />
              <LearningLogoRow duplicate />
            </div>
          </div>
        </article>

        <article className={`${styles.card} ${styles.weworkCard}`}>
          <img src="/careers-media/unsplash_ZFy_KeVv8vE.png" alt="" />
          <h3 data-careers-reveal>WeWork Passes</h3>
        </article>

        <article className={`${styles.card} ${styles.homeOfficeCard}`}>
          <img src="/careers-media/unsplash_otfbs6vO4N8.png" alt="" />
          <p data-careers-reveal>Home Office Allowances</p>
        </article>
      </div>
    </div>
  );
}
