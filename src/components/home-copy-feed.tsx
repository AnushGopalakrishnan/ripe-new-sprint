import styles from "./home-copy-feed.module.css";

const images = {
  raf: "/feed-media/maison.jpg",
  barDoubble: "/work-media/sticky-notes.png",
  mira: "/work-media/mira.png",
  avantis: "/work-media/avantis.png",
  zetachain: "/work-media/zetachain.png",
  oum: "/work-media/oum-ceramics.png",
  volvo: "/work-media/volvo.png",
  rick: "/feed-media/rick.jpg",
};

type ImageCardProps = {
  title: string;
  label?: string;
  src: string;
  size?: "medium" | "large" | "wide";
  tone?: "light" | "dark";
  position?: string;
};

type TextCardProps = {
  title: string;
  label: string;
  eyebrow?: string;
  size?: "small" | "medium" | "large";
  variant?: "white" | "cream";
};

function TextCard({ title, label, eyebrow, size = "medium", variant = "white" }: TextCardProps) {
  return (
    <article className={`${styles.card} ${styles.textCard} ${styles[size]} ${styles[variant]}`}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h3>{title}</h3>
      <p className={styles.label}>{label}</p>
    </article>
  );
}

function ImageCard({ title, label = "Case Study", src, size = "large", tone = "light", position }: ImageCardProps) {
  return (
    <article className={`${styles.card} ${styles.imageCard} ${styles[size]} ${tone === "dark" ? styles.darkText : ""}`}>
      <img src={src} alt="" loading="lazy" style={position ? { objectPosition: position } : undefined} />
      <div className={styles.imageShade} />
      <h3>{title}</h3>
      <p className={styles.imageLabel}>{label}</p>
    </article>
  );
}

function ClientsCard() {
  return (
    <article className={`${styles.card} ${styles.clientsCard} ${styles.medium}`}>
      <p className={styles.eyebrow}>Rahul Kashyap</p>
      <div className={styles.clientsMarquee} aria-hidden="true">
        <div>
          <span>ENA</span>
          <span>FILIPPE MONET</span>
          <span>APEX I</span>
          <span>Sensa</span>
          <span>ENA</span>
          <span>FILIPPE MONET</span>
          <span>APEX I</span>
          <span>Sensa</span>
        </div>
      </div>
      <p className={styles.label}>Clients</p>
    </article>
  );
}

function ServicesCard() {
  return (
    <article className={`${styles.card} ${styles.servicesCard} ${styles.large}`}>
      <img src={images.zetachain} alt="" loading="lazy" />
      <div className={styles.arrowStack} aria-hidden="true">
        <span>↗</span>
        <span>↙</span>
      </div>
      <h3>Zetachain</h3>
      <p className={styles.imageLabel}>Case Study</p>
    </article>
  );
}

export function HomeCopyFeed() {
  return (
    <section className={styles.feed} aria-label="Redesigned home feed">
      <div className={styles.grid}>
        <div className={styles.column}>
          <TextCard title="Raf Simmons" label="Case Study" size="small" />
          <TextCard title="We built a new online presence!" label="Studio Thoughts" eyebrow="Rahul Kashyap" size="large" variant="cream" />
          <ImageCard title="Avantis" src={images.avantis} size="medium" position="center" />
          <TextCard
            title="We are driven by concepts, dedicated to creating, expressing, and enhancing brand identities."
            label="About"
            size="medium"
          />
        </div>

        <div className={styles.column}>
          <ImageCard title="Bar Doubble" label="Work" src={images.barDoubble} size="large" position="center 42%" />
          <TextCard
            title="For us, everything begins with the strength of a compelling concept. Our methodology stems from transforming stories into unique and adaptable creations designed for growth and precision."
            label="About"
            size="medium"
          />
          <ClientsCard />
          <ImageCard title="Oum Ceramics" label="Work" src={images.oum} size="large" position="center 48%" />
        </div>

        <div className={styles.column}>
          <ImageCard title="Mira" src={images.mira} size="medium" position="center 42%" />
          <TextCard title="Talk at the Art Directors Club" label="Case Study" eyebrow="Rahul Kashyap" size="large" variant="cream" />
          <ServicesCard />
          <TextCard title="Brand Identity" label="Services" size="medium" />
          <ImageCard title="Volvo" label="Work" src={images.volvo} size="large" position="center 50%" />
        </div>
      </div>
    </section>
  );
}
