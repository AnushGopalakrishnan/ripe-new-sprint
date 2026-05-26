"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./careers-mosaic.module.css";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Veru Studio transformed our brand with their fresh and innovative design approach. Their team was professional, attentive, and delivered beyond our expectations. Highly recommend!",
    name: "Sarah Martinez",
    role: "Marketing Manager",
  },
  {
    quote:
      "Working with Veru Studio was a game-changer for our project. Their creativity and attention to detail brought our vision to life. I couldn't be happier with the results.",
    name: "Jason Lee",
    role: "Creative Director",
  },
  {
    quote:
      "Veru Studio's team is nothing short of amazing. They understood our brand's needs and created stunning visuals that resonate perfectly with our audience.",
    name: "Emily Johnson",
    role: "CEO",
  },
  {
    quote:
      "From concept to execution, Veru Studio exceeded our expectations. Their expertise in design and branding helped us stand out in a crowded market. A pleasure to work with!",
    name: "Michael Thompson",
    role: "Product Manager",
  },
  {
    quote:
      "Veru Studio delivered exceptional work on time and within budget. Their creative solutions truly captured the essence of our brand. We couldn't ask for a better partner!",
    name: "Lisa Collins",
    role: "Head of Communications",
  },
];

const serviceWords = ["Branding", "Strategy", "Webdesign"];

const logos = [
  "/logos/studio-logo-1.svg",
  "/logos/studio-logo-2.svg",
  "/logos/studio-logo-3.svg",
  "/logos/studio-logo-4.svg",
  "/logos/studio-logo-5.svg",
  "/logos/studio-logo-6.svg",
];

function PulseLabel({ label, meta, light = false }: { label: string; meta?: string; light?: boolean }) {
  return (
    <div className={`${styles.topTag} ${light ? styles.topTagLight : ""}`}>
      <div className={styles.pulseWrap} aria-hidden="true">
        <span className={styles.pulseDot}>
          <span className={styles.pulseCore} />
        </span>
        <span className={styles.pulseRing} />
      </div>
      <span className={styles.topTagText}>{label}</span>
      {meta ? <span className={styles.topTagMeta}>{meta}</span> : null}
    </div>
  );
}

export default function CareersMosaic() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setServiceIndex((prev) => (prev + 1) % serviceWords.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  const serviceWord = useMemo(() => serviceWords[serviceIndex], [serviceIndex]);
  const activeTestimonial = testimonials[testimonialIndex];

  return (
    <section className={styles.wrap} aria-label="Studio mosaic">
      <div className={styles.gridTop}>
        <div className={styles.columnLeft}>
          <article className={`${styles.card} ${styles.cardAbout}`}>
            <PulseLabel label="About" />
            <p>
              We bring brands to life with bold design and innovative storytelling. From striking visuals to immersive
              experiences, we turn ideas into realities.
            </p>
            <Link href="/">Read more</Link>
          </article>

          <article className={`${styles.card} ${styles.cardTestimonial}`}>
            <PulseLabel label="Testimonials" light />
            <blockquote>&ldquo;{activeTestimonial.quote}&rdquo;</blockquote>
            <p className={styles.testimonialAuthor}>{activeTestimonial.name}</p>
            <p className={styles.testimonialRole}>{activeTestimonial.role}</p>
            <div className={styles.dots} role="tablist" aria-label="Testimonials">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === testimonialIndex ? styles.dotActive : styles.dot}
                  onClick={() => setTestimonialIndex(index)}
                  aria-label={`Show testimonial ${index + 1}`}
                />
              ))}
            </div>
          </article>
        </div>

        <div className={styles.columnCenter}>
          <article className={`${styles.card} ${styles.cardImageTall}`}>
            <PulseLabel label="About" meta="(TEAM)" />
            <img src="/careers-media/mosaic-team.jpg" alt="Studio team portrait" />
            <div className={styles.hoverTitle}>Who we are?</div>
            <span className={styles.hoverArrow} aria-hidden="true">-&gt;</span>
          </article>

          <article className={`${styles.card} ${styles.cardServices}`}>
            <PulseLabel label="Services" meta="(3)" />
            <p className={styles.typeWord}>
              {serviceWord}
              <span className={styles.typeCursor}>|</span>
            </p>
          </article>
        </div>

        <div className={styles.columnRight}>
          <article className={`${styles.card} ${styles.cardClients}`}>
            <PulseLabel label="Clients" light />
            <div className={styles.logoTicker} aria-hidden="true">
              <div className={styles.logoTrack}>
                {[0, 1].map((copy) => (
                  <div key={copy} className={styles.logoRow}>
                    {logos.map((logo, index) => (
                      <img key={`${copy}-${index}`} src={logo} alt="" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className={`${styles.card} ${styles.cardImageTall}`}>
            <PulseLabel label="Work" meta="(BRANDING)" />
            <img src="/careers-media/mosaic-work.jpg" alt="Girl dancing in the streets" />
            <div className={styles.hoverTitle}>Design Freaks</div>
            <span className={styles.hoverArrow} aria-hidden="true">-&gt;</span>
          </article>
        </div>
      </div>

      <div className={styles.gridBottom}>
        <article className={`${styles.card} ${styles.cardBlog}`}>
          <PulseLabel label="Blog" meta="10/30/24" light />
          <img src="/careers-media/mosaic-blog-1.jpg" alt="Old library with books" />
        </article>
        <article className={`${styles.card} ${styles.cardBlog}`}>
          <PulseLabel label="Blog" meta="10/20/24" light />
          <img src="/careers-media/mosaic-blog-2.jpg" alt="Asian woman photoshoot" />
        </article>
        <article className={`${styles.card} ${styles.cardBlog}`}>
          <PulseLabel label="Blog" meta="10/10/24" light />
          <img src="/careers-media/mosaic-blog-3.jpg" alt="Young woman in a tram" />
        </article>
      </div>
    </section>
  );
}
