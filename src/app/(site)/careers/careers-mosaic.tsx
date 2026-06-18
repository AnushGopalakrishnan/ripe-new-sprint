import styles from "./careers-mosaic.module.css";

type Benefit = {
  title: string;
  image?: string;
};

const benefits = {
  referralBonuses: {
    title: "Project Referral Bonuses",
  },
  headspace: {
    title: "Annual headspace Subscription",
    image: "/careers-media/benefit-headspace.png",
  },
  designerReferrals: {
    title: "Designer Referrals*",
  },
  offsite: {
    title: "Yearly, all expenses paid offsite Educational Reimbursements",
    image: "/careers-media/mosaic-work.jpg",
  },
  skillshare: {
    title: "Annual Skillshare Subscription",
    image: "/careers-media/benefit-skillshare.png",
  },
  medical: {
    title: "Medical Health Allowance",
  },
  homeOffice: {
    title: "Home Office Allowance",
    image: "/careers-media/mosaic-blog-2.jpg",
  },
  weWork: {
    title: "We Work Passes",
    image: "/careers-media/benefit-wework-passes.png",
  },
} satisfies Record<string, Benefit>;

function BenefitCard({
  benefit,
  className,
}: {
  benefit: Benefit;
  className?: string;
}) {
  return (
    <article className={`${styles.card} ${benefit.image ? styles.cardImage : styles.cardText} ${className ?? ""}`}>
      {benefit.image ? <img src={benefit.image} alt="" loading="lazy" aria-hidden="true" /> : null}
      <h3>{benefit.title}</h3>
    </article>
  );
}

export default function CareersMosaic() {
  return (
    <section className={styles.wrap} aria-label="Benefits of working at Ripe">
      <div className={styles.gridTop}>
        <div className={styles.columnLeft}>
          <BenefitCard benefit={benefits.referralBonuses} className={styles.cardAbout} />
          <BenefitCard benefit={benefits.headspace} className={styles.cardTestimonial} />
        </div>

        <div className={styles.columnCenter}>
          <BenefitCard benefit={benefits.offsite} className={styles.cardImageTall} />
          <BenefitCard benefit={benefits.designerReferrals} className={styles.cardServices} />
        </div>

        <div className={styles.columnRight}>
          <BenefitCard benefit={benefits.skillshare} className={styles.cardClients} />
          <BenefitCard benefit={benefits.medical} className={styles.cardImageTall} />
        </div>
      </div>

      <div className={styles.gridBottom}>
        <BenefitCard benefit={benefits.homeOffice} className={styles.cardBlog} />
        <BenefitCard benefit={benefits.weWork} className={styles.cardBlog} />
      </div>
    </section>
  );
}
