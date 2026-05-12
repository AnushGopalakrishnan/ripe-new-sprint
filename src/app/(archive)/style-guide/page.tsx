import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./style-guide.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ripe Style Guide",
  robots: {
    follow: false,
    index: false,
  },
};

function assertStyleGuideAccess() {
  const isProductionDeployment = process.env.VERCEL_ENV === "production";
  const explicitlyEnabled = process.env.ENABLE_STYLE_GUIDE === "true";

  if (isProductionDeployment && !explicitlyEnabled) {
    notFound();
  }
}

const navItems = [
  ["Tokens", "#tokens"],
  ["Typography", "#typography"],
  ["Color", "#color"],
  ["Components", "#components"],
  ["Forms", "#forms"],
  ["Motion", "#motion"],
];

const swatches = [
  {
    className: styles.swatchDark,
    code: "--ripe-color-ink / #191919",
    name: "Ink",
  },
  {
    className: styles.swatchBeige,
    code: "--ripe-color-beige / #f1ebe2",
    name: "Beige",
  },
  {
    className: styles.swatchAccent,
    code: "--ripe-color-accent / #ff4c24",
    name: "Accent",
  },
  {
    className: "",
    code: "--ripe-color-paper / #ffffff",
    name: "Paper",
  },
  {
    className: styles.swatchMuted,
    code: "--ripe-color-ink-05 / #3c1b0b0d",
    name: "Wash",
  },
  {
    className: "",
    code: "--ripe-color-ink-60 / #19191999",
    name: "Ink 60",
  },
];

export default function StyleGuidePage() {
  assertStyleGuideAccess();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandWord}>Ripe</span>
            <span className={styles.pill}>Style System</span>
          </Link>
          <nav className={styles.nav} aria-label="Style guide sections">
            {navItems.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.kicker}>Internal design surface / not public production nav</p>
            <h1 className={styles.heroTitle}>The Natural Outcome</h1>
            <p className={styles.heroCopy}>
              A working UI kit for designing future Ripe pages against the current site language:
              Plantin editorial scale, Graphik utility, restrained borders, warm neutrals, and
              precise interaction states.
            </p>
          </div>
        </section>

        <section className={styles.metaGrid} id="tokens" aria-label="Core token summary">
          {[
            ["Fonts", "3"],
            ["Color Base", "Ink"],
            ["Max Width", "1440"],
            ["Access", "Preview"],
          ].map(([label, value]) => (
            <article className={styles.metaCard} key={label}>
              <p className={styles.metaLabel}>{label}</p>
              <p className={styles.metaValue}>{value}</p>
            </article>
          ))}
        </section>

        <section className={styles.section} id="typography">
          <div className={styles.sectionHeader}>
            <span className={styles.pill}>Typography</span>
            <h2 className={styles.sectionTitle}>Editorial first, utility second.</h2>
            <p className={styles.sectionCopy}>
              Use Plantin MT Pro Light at 300 for the brand voice and large expressive moments. Use
              Graphik for UI structure, cards, labels, and dense content. Chivo Mono stays reserved
              for metadata.
            </p>
          </div>
          <div className={styles.stack}>
            <div className={styles.typeSpec}>
              <p className={styles.displayType}>Ripe Studios</p>
              <p className={styles.spec}>Display / Plantin MT Pro Light / 300 / tight tracking / hero only</p>
            </div>
            <div className={styles.typeSpec}>
              <p className={styles.serifType}>The color notes are visual notes.</p>
              <p className={styles.spec}>Editorial / Plantin MT Pro Light / 300 / section headlines</p>
            </div>
            <div className={styles.typeSpec}>
              <p className={styles.sansType}>Case studies, writing, team, services.</p>
              <p className={styles.spec}>Interface / Graphik / cards, controls, content lists</p>
            </div>
            <div className={styles.typeSpec}>
              <p className={styles.monoType}>CMS FIELD / UPDATED 08 MAY / DRAFT SAFE</p>
              <p className={styles.spec}>Metadata / Chivo Mono / eyebrows, system labels</p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="color">
          <div className={styles.sectionHeader}>
            <span className={styles.pill}>Color</span>
            <h2 className={styles.sectionTitle}>Quiet base, sharp interruptions.</h2>
            <p className={styles.sectionCopy}>
              Start with ink, paper, and beige. Use the orange accent sparingly for active states,
              warnings, and high-intent actions.
            </p>
          </div>
          <div className={styles.swatchGrid}>
            {swatches.map((swatch) => (
              <article className={`${styles.swatch} ${swatch.className}`} key={swatch.code}>
                <h3 className={styles.swatchName}>{swatch.name}</h3>
                <p className={styles.swatchCode}>{swatch.code}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="components">
          <div className={styles.sectionHeader}>
            <span className={styles.pill}>Components</span>
            <h2 className={styles.sectionTitle}>Reusable patterns to pull from.</h2>
            <p className={styles.sectionCopy}>
              Design new sections here first, then graduate them into shared components. This keeps
              edits visible and prevents one-off styling from spreading quietly.
            </p>
          </div>
          <div className={styles.stack}>
            <div className={styles.buttonRow}>
              <Link className={`${styles.button} ${styles.buttonFilled}`} href="/case-studies">
                Primary Button
              </Link>
              <Link className={styles.button} href="/writing">
                Secondary Button
              </Link>
              <button className={`${styles.button} ${styles.buttonAccent}`} type="button">
                Accent Action
              </button>
              <button className={styles.smallButton} type="button">
                Small Control
              </button>
            </div>

            <div className={styles.componentGrid}>
              <article className={styles.componentCard}>
                <div>
                  <span className={styles.pill}>Feed Card</span>
                  <h3 className={styles.componentTitle}>Natural systems for messy launches.</h3>
                </div>
                <p className={styles.componentText}>
                  Small editorial cards should feel quiet until the user hovers, filters, or edits them.
                </p>
              </article>
              <article className={`${styles.componentCard} ${styles.darkSurface}`}>
                <div>
                  <span className={styles.pill}>Dark Surface</span>
                  <h3 className={styles.componentTitle}>High contrast, low noise.</h3>
                </div>
                <p className={styles.componentText}>
                  Use for footers, takeover panels, video moments, and dense navigation contexts.
                </p>
              </article>
              <article className={styles.componentCard}>
                <div>
                  <span className={styles.pill}>CMS Module</span>
                  <h3 className={styles.componentTitle}>Designed for editable fields.</h3>
                </div>
                <p className={styles.componentText}>
                  Every block here should map cleanly to Sanity fields and the in-page editor.
                </p>
              </article>
            </div>

            <article className={styles.caseCard}>
              <div className={styles.caseMedia} aria-hidden="true" />
              <div className={styles.caseBody}>
                <span className={styles.pill}>Case Study</span>
                <h3 className={styles.caseTitle}>Sticky Notes</h3>
                <p className={styles.componentText}>
                  Case-study cards should preserve the current Webflow cadence: large image surface,
                  sparse metadata, and typography that does most of the work.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.section} id="forms">
          <div className={styles.sectionHeader}>
            <span className={styles.pill}>Forms</span>
            <h2 className={styles.sectionTitle}>Editor and CMS controls.</h2>
            <p className={styles.sectionCopy}>
              These patterns are for the future editing sidebar, Sanity previews, and internal
              drafting tools. Functional, not decorative.
            </p>
          </div>
          <form className={`${styles.surface} ${styles.form}`}>
            <div className={styles.field}>
              <label htmlFor="sg-title">Title</label>
              <input id="sg-title" defaultValue="The Natural Outcome" />
            </div>
            <div className={styles.field}>
              <label htmlFor="sg-type">Content Type</label>
              <select id="sg-type" defaultValue="case-study">
                <option value="case-study">Case Study</option>
                <option value="writing">Writing</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="sg-notes">Design Notes</label>
              <textarea id="sg-notes" defaultValue="Keep it exact. Do not drift from the Ripe visual language." />
            </div>
          </form>
        </section>

        <section className={styles.section} id="motion">
          <div className={styles.sectionHeader}>
            <span className={styles.pill}>Motion</span>
            <h2 className={styles.sectionTitle}>Slow enough to feel intentional.</h2>
            <p className={styles.sectionCopy}>
              Prefer fewer, larger gestures over default micro-animation. The site should feel
              composed, not twitchy.
            </p>
          </div>
          <div className={styles.stateRail}>
            <div className={styles.motionCard}>
              <div className={styles.motionOrb} />
              <p className={styles.motionText}>Use motion as pacing, not decoration.</p>
            </div>
            <div className={styles.surface}>
              <p className={styles.kicker}>Implementation Rule</p>
              <p className={styles.componentText}>
                New design experiments should start here. When approved, extract the CSS variables or
                component into shared app code so updates propagate across the real site.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
