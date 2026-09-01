import type { MouseEventHandler } from "react";
import styles from "@/components/contact-cta.module.css";

export type ContactCtaProps = {
  email?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  reveal?: boolean;
  revealDelay?: number;
};

export function ContactCta({ email = "hello@ripe.studio", onClick, reveal = false, revealDelay }: ContactCtaProps) {
  return (
    <a
      className={styles.root}
      data-careers-reveal={reveal ? "" : undefined}
      data-careers-reveal-delay={reveal && revealDelay !== undefined ? revealDelay : undefined}
      href={`mailto:${email}`}
      onClick={onClick}
    >
      Get In Touch
    </a>
  );
}
