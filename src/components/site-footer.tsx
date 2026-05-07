import styles from "@/components/site-footer.module.css";
import type { NavLink, SocialLink } from "@/types/content";

type SiteFooterProps = {
  footerNav: NavLink[];
  socialLinks: SocialLink[];
  contactEmail: string;
  location: string;
};

export function SiteFooter({
  footerNav,
  socialLinks,
  contactEmail,
  location,
}: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className="page-grid">
        <div className={`${styles.shell} card-surface`}>
          <div className={styles.top}>
            <div>
              <p className="eyebrow">Build The Durable Version</p>
              <h2 className={styles.title}>
                Motion-rich marketing without runtime guesswork.
              </h2>
            </div>
            <p className={styles.copy}>
              This scaffold keeps the visual range while replacing loader
              scripts, duplicated vendor files, and DOM scraping with typed
              content and route-local components.
            </p>
          </div>
          <div className={styles.links}>
            {footerNav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <div className={styles.bottom}>
            <div className={styles.meta}>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              <span>{location}</span>
            </div>
            <div className={styles.meta}>
              {socialLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
