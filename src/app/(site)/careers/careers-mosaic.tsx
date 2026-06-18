import styles from "./careers-mosaic.module.css";

type Benefit = {
  title: string;
  image?: string;
};

const benefits: Benefit[] = [
  {
    title: "Project Referral Bonuses",
  },
  {
    title: "Annual headspace Subscription",
    image: "/careers-media/mosaic-team.jpg",
  },
  {
    title: "Designer Referrals*",
  },
  {
    title: "Yearly, all expenses paid offsite Educational Reimbursements",
    image: "/careers-media/mosaic-work.jpg",
  },
  {
    title: "Annual Skillshare Subscription",
    image: "/careers-media/mosaic-blog-1.jpg",
  },
  {
    title: "Medical Health Allowance",
  },
  {
    title: "Home Office Allowance",
    image: "/careers-media/mosaic-blog-2.jpg",
  },
  {
    title: "We Work Passes",
    image: "/careers-media/mosaic-blog-3.jpg",
  },
];

export default function CareersMosaic() {
  return (
    <section className={styles.wrap} aria-label="Benefits of working at Ripe">
      <div className={styles.benefitsGrid}>
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className={`${styles.benefitCard} ${benefit.image ? styles.benefitCardImage : ""}`}
          >
            {benefit.image ? <img src={benefit.image} alt="" loading="lazy" aria-hidden="true" /> : null}
            <h3>{benefit.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
