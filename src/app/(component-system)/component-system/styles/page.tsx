import type { CSSProperties } from "react";
import type { Metadata } from "next";
import careersTypeStyles from "@/styles/careers-typography.module.css";
import styles from "../component-system.module.css";

export const metadata: Metadata = { title: "Styles" };

const foundations = ["typography", "color", "spacing", "borders", "breakpoints", "icons", "motion", "themes"];

const colors = [
  ["Ink", "#191919", "#191919"],
  ["Ink 60", "#19191999", "#19191999"],
  ["Ink 40", "#19191966", "#19191966"],
  ["Ink 10", "#1919191a", "#1919191a"],
  ["Ink 05", "#3c1b0b0d", "#3c1b0b0d"],
  ["Paper", "#ffffff", "#ffffff"],
  ["Beige", "#f1ebe2", "#f1ebe2"],
  ["Charcoal", "#201d1d", "#201d1d"],
] as const;

const breakpoints = [
  ["Public navigation", "739px"],
  ["Home feed", "991px / 640px"],
  ["Work journal", "50.5625em"],
  ["Team directory", "992px"],
  ["Case-study detail", "900px / 760px / 560px"],
] as const;

type TypographySpecimen = {
  element?: "h1" | "h2" | "h3" | "h4" | "p";
  semanticCareersStyle?: boolean;
  name: string;
  usage: string;
  sample: string;
  source: string;
  settings: {
    family: string;
    size: string;
    weight: string;
    lineHeight: string;
    letterSpacing: string;
    wordSpacing: string;
    transform: string;
    style: string;
  };
  sampleStyle?: CSSProperties;
};

const typography: TypographySpecimen[] = [
  {
    element: "h1",
    semanticCareersStyle: true,
    name: "H1",
    usage: "Careers hero and large display headings",
    sample: "A brand design studio where success feels personal.",
    source: "careers-typography.module.css · h1 / .h1",
    settings: { family: "Plantin MT Pro Light", size: "2.25rem", weight: "300", lineHeight: "1.333", letterSpacing: "-0.0044em", wordSpacing: "normal", transform: "none", style: "normal" },
  },
  {
    element: "h2",
    semanticCareersStyle: true,
    name: "H2",
    usage: "Careers benefit and founder titles",
    sample: "The pillars that Ripe is built on",
    source: "careers-typography.module.css · h2 / .h2",
    settings: { family: "Plantin MT Pro Light", size: "1.75rem", weight: "300", lineHeight: "1.333", letterSpacing: "-0.0044em", wordSpacing: "normal", transform: "none", style: "normal" },
  },
  {
    element: "h3",
    semanticCareersStyle: true,
    name: "H3",
    usage: "Careers prominent supporting copy",
    sample: "Collective progression",
    source: "careers-typography.module.css · h3 / .h3",
    settings: { family: "Plantin MT Pro Light", size: "1.25rem", weight: "300", lineHeight: "1.2", letterSpacing: "-0.008em", wordSpacing: "normal", transform: "none", style: "normal" },
  },
  {
    element: "h4",
    semanticCareersStyle: true,
    name: "H4",
    usage: "Careers labels, founder roles, and open-role titles",
    sample: "Designer — Remote",
    source: "careers-typography.module.css · h4 / .h4",
    settings: { family: "Plantin MT Pro Light", size: "1rem", weight: "300", lineHeight: "1.2", letterSpacing: "-0.01em", wordSpacing: "normal", transform: "none", style: "normal" },
  },
  {
    element: "p",
    semanticCareersStyle: true,
    name: "Paragraph",
    usage: "Careers body and supporting copy",
    sample: "Individual brilliance matters, but shared knowledge transforms.",
    source: "careers-typography.module.css · p / .paragraph",
    settings: { family: "Plantin MT Pro Light", size: "1rem", weight: "300", lineHeight: "1.375", letterSpacing: "0", wordSpacing: "normal", transform: "none", style: "normal" },
  },
  {
    name: "Journal display",
    usage: "Work-journal filters, card titles, and list columns",
    sample: "Strategy, Identity, Motion, Web Design.",
    source: "work-journal-section.module.css · shared journal display selectors",
    settings: { family: "Plantin MT Pro Light", size: "clamp(2.125rem, 2.944vw, 2.65rem)", weight: "400", lineHeight: "1.03", letterSpacing: "-0.02em", wordSpacing: "normal", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: "var(--ripe-font-serif)", fontSize: "clamp(2.125rem, 2.944vw, 2.65rem)", fontWeight: 400, lineHeight: 1.03, letterSpacing: "-0.02em" },
  },
  {
    name: "Feed card title",
    usage: "Home-feed project, utility, and service card titles",
    sample: "The natural outcome",
    source: "home-feed.module.css · .title",
    settings: { family: "Plantin MT Pro Light", size: "clamp(31px, 2.45vw, 38px)", weight: "400", lineHeight: "0.98", letterSpacing: "-0.035em", wordSpacing: "0.04em", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: "var(--ripe-font-serif)", fontSize: "clamp(31px, 2.45vw, 38px)", fontWeight: 400, lineHeight: 0.98, letterSpacing: "-0.035em", wordSpacing: "0.04em" },
  },
  {
    name: "Feed display copy",
    usage: "Home-feed green, narrative, time, and sounds cards",
    sample: "We are driven by concepts.",
    source: "home-feed.module.css · shared feed display selectors",
    settings: { family: "Plantin MT Pro Light", size: "clamp(28px, 2.25vw, 34px)", weight: "400", lineHeight: "0.98", letterSpacing: "-0.035em", wordSpacing: "0.04em", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: "var(--ripe-font-serif)", fontSize: "clamp(28px, 2.25vw, 34px)", fontWeight: 400, lineHeight: 0.98, letterSpacing: "-0.035em", wordSpacing: "0.04em" },
  },
  {
    name: "Feed body copy",
    usage: "Compact home-feed narrative cards",
    sample: "Everything begins with the strength of a compelling concept.",
    source: "home-feed.module.css · .bodyCopy",
    settings: { family: "Plantin MT Pro Light", size: "clamp(16px, 1.2vw, 18px)", weight: "400", lineHeight: "1.05", letterSpacing: "-0.02em", wordSpacing: "0.03em", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: "var(--ripe-font-serif)", fontSize: "clamp(16px, 1.2vw, 18px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", wordSpacing: "0.03em" },
  },
  {
    name: "Navigation primary",
    usage: "Primary links in the open public navigation",
    sample: "Work Services Writing Team Careers",
    source: "public-navigation.module.css · .primaryList",
    settings: { family: "Plantin MT Pro Light", size: "32px", weight: "400", lineHeight: "1", letterSpacing: "normal", wordSpacing: "normal", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: "var(--ripe-font-serif)", fontSize: "32px", fontWeight: 400, lineHeight: 1 },
  },
  {
    name: "Interface control",
    usage: "Work-journal view controls",
    sample: "List View",
    source: "work-journal-section.module.css · .viewButton",
    settings: { family: "Graphik", size: "0.875rem", weight: "400", lineHeight: "1.4286", letterSpacing: "0.0107em", wordSpacing: "normal", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: '"Graphik", Arial, sans-serif', fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.4286, letterSpacing: "0.0107em" },
  },
  {
    name: "Interface pill",
    usage: "Home-feed labels and actions",
    sample: "Case Study / View",
    source: "home-feed.module.css · .pill",
    settings: { family: "Graphik", size: "13px", weight: "400", lineHeight: "13px", letterSpacing: "normal", wordSpacing: "normal", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: '"Graphik", "GraphikRegular", sans-serif', fontSize: "13px", fontWeight: 400, lineHeight: "13px" },
  },
  {
    name: "Case-study body",
    usage: "Project facts and information copy",
    sample: "A shared language gives a project enough structure to remain recognizable.",
    source: "detail-page.module.css · .formaInformation p",
    settings: { family: "Graphik", size: "15px", weight: "400", lineHeight: "1.38", letterSpacing: "normal", wordSpacing: "normal", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: '"Graphik", Arial, sans-serif', fontSize: "15px", fontWeight: 400, lineHeight: 1.38 },
  },
  {
    name: "Case-study label",
    usage: "Project fact and information labels",
    sample: "(Information)",
    source: "detail-page.module.css · .formaLabel",
    settings: { family: "Graphik", size: "11px", weight: "400", lineHeight: "1", letterSpacing: "normal", wordSpacing: "normal", transform: "uppercase", style: "normal" },
    sampleStyle: { fontFamily: '"Graphik", Arial, sans-serif', fontSize: "11px", fontWeight: 400, lineHeight: 1, textTransform: "uppercase" },
  },
  {
    name: "Technical metadata",
    usage: "Work-journal empty and system metadata",
    sample: "Component / Variant / State",
    source: "work-journal-section.module.css · .empty",
    settings: { family: "Chivo Mono", size: "0.75rem", weight: "400", lineHeight: "1.3", letterSpacing: "-0.02em", wordSpacing: "normal", transform: "none", style: "normal" },
    sampleStyle: { fontFamily: '"Chivo Mono", "Courier New", monospace', fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.3, letterSpacing: "-0.02em" },
  },
];

export default function ComponentSystemStylesPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Foundations / Current production tokens</p>
          <h1 className={styles.pageTitle}>Styles</h1>
        </div>
        <p className={styles.pageIntro}>Defined source tokens and the component-specific conventions currently used by the public site.</p>
      </header>
      <nav className={styles.categoryIndex} aria-label="Style categories">
        {foundations.map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
      </nav>

      <section className={styles.foundationSection} id="typography">
        <header className={styles.sectionHeading}>
          <span className={styles.eyebrow}>01</span>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <p className={styles.sectionIntro}>These are the distinct typography roles currently rendered by the shared public components and active careers page. Values mirror their production declarations exactly.</p>
        </header>
        <div className={styles.foundationBody}>
          <div className={styles.typeInventory}>
            {typography.map((typeStyle) => {
              const SampleElement = typeStyle.element ?? "p";
              const sample = <SampleElement className={styles.typeSample} style={typeStyle.sampleStyle}>{typeStyle.sample}</SampleElement>;
              return (
              <article className={styles.typeSpecimen} key={typeStyle.name}>
                <header className={styles.typeSpecimenHeader}>
                  <div>
                    <h3>{typeStyle.name}</h3>
                    <p>{typeStyle.usage}</p>
                  </div>
                  <code>{typeStyle.source}</code>
                </header>
                {typeStyle.semanticCareersStyle ? <div className={careersTypeStyles.scope}>{sample}</div> : sample}
                <dl className={styles.typeSettings}>
                  {Object.entries(typeStyle.settings).map(([setting, value]) => (
                    <div key={setting}>
                      <dt>{setting.replace(/([A-Z])/g, " $1")}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.foundationSection} id="color">
        <header className={styles.sectionHeading}><span className={styles.eyebrow}>02</span><h2 className={styles.sectionTitle}>Color</h2><p className={styles.sectionIntro}>Every swatch below is a variable currently defined in the shared token stylesheet.</p></header>
        <div className={styles.foundationBody}><div className={styles.swatches}>{colors.map(([name, value, background]) => <article className={styles.swatch} key={name} style={{ background, color: name === "Ink" || name === "Charcoal" ? "#fff" : "#191919" }}><strong>{name}</strong><code>{value}</code></article>)}</div></div>
      </section>

      <section className={styles.foundationSection} id="spacing">
        <header className={styles.sectionHeading}><span className={styles.eyebrow}>03</span><h2 className={styles.sectionTitle}>Spacing</h2><p className={styles.sectionIntro}>These shared tokens are defined in source. Current production components also retain component-owned spacing from the exported site CSS.</p></header>
        <div className={styles.foundationBody}><div className={styles.tokenGrid}>{[["2XS","0.25rem"],["XS","0.5rem"],["SM","0.75rem"],["MD","1rem"],["LG","1.5rem"],["XL","2rem"],["2XL","3rem"],["3XL","4.5rem"],["Max width","1440px"]].map(([name,value]) => <article className={styles.token} key={name}><strong>{name}</strong><code>{value}</code><div style={{ width: value.includes("rem") ? value : "100%", height: 8, marginTop: 24, background: "#ff4c24" }} /></article>)}</div></div>
      </section>

      <section className={styles.foundationSection} id="borders">
        <header className={styles.sectionHeading}><span className={styles.eyebrow}>04</span><h2 className={styles.sectionTitle}>Borders</h2><p className={styles.sectionIntro}>The shared source defines solid and muted one-pixel rules. Radius remains component-owned.</p></header>
        <div className={styles.foundationBody}><div className={styles.tokenGrid}><article className={styles.token}><strong>Line</strong><code>1px solid Ink</code></article><article className={styles.token}><strong>Muted line</strong><code>1px solid Ink 10</code></article><article className={styles.token}><strong>Radius</strong><code>0 / component-owned</code></article></div></div>
      </section>

      <section className={styles.foundationSection} id="breakpoints">
        <header className={styles.sectionHeading}><span className={styles.eyebrow}>05</span><h2 className={styles.sectionTitle}>Breakpoints</h2><p className={styles.sectionIntro}>There is no single three-tier breakpoint system today. These are the exact media-query boundaries used by the documented components.</p></header>
        <div className={styles.foundationBody}><div className={styles.tokenGrid}>{breakpoints.map(([name,value]) => <article className={styles.token} key={name}><strong>{name}</strong><code>{value}</code></article>)}</div></div>
      </section>

      <section className={styles.foundationSection} id="icons">
        <header className={styles.sectionHeading}><span className={styles.eyebrow}>06</span><h2 className={styles.sectionTitle}>Icons</h2><p className={styles.sectionIntro}>The public site does not currently have a shared icon component or icon token set.</p></header>
        <div className={styles.foundationBody}><div className={styles.tokenGrid}><article className={styles.token}><strong>Navigation</strong><code>Component-owned logo, menu and close marks</code></article><article className={styles.token}><strong>Player</strong><code>Component-owned inline SVG controls</code></article><article className={styles.token}><strong>Shared library</strong><code>None</code></article></div></div>
      </section>

      <section className={styles.foundationSection} id="motion">
        <header className={styles.sectionHeading}><span className={styles.eyebrow}>07</span><h2 className={styles.sectionTitle}>Motion</h2><p className={styles.sectionIntro}>The first four values are shared tokens. Navigation close timing and reduced-motion handling are current component behavior.</p></header>
        <div className={styles.foundationBody}><div className={styles.tokenGrid}>{[["Fast","180ms"],["Base","280ms"],["Slow","560ms"],["Ease","cubic-bezier(.22,1,.36,1)"],["Navigation close","850ms"],["Reduced motion","No transform sequence"]].map(([name,value]) => <article className={styles.token} key={name}><strong>{name}</strong><code>{value}</code></article>)}</div></div>
      </section>

      <section className={styles.foundationSection} id="themes">
        <header className={styles.sectionHeading}><span className={styles.eyebrow}>08</span><h2 className={styles.sectionTitle}>Tone contexts</h2><p className={styles.sectionIntro}>Navigation has explicit dark and light tones. Work-journal project colors come from CMS content and compute their text tone at runtime.</p></header>
        <div className={styles.foundationBody}><div className={styles.toneGrid}><article className={styles.tone} style={{background:"#fff"}}><strong>Light surface</strong><code>data-tone=&quot;dark&quot;</code></article><article className={styles.tone} style={{background:"#191919",color:"#fff"}}><strong>Dark surface</strong><code>data-tone=&quot;light&quot;</code></article><article className={styles.tone} style={{background:"#f1ebe2"}}><strong>Project surface</strong><code>CMS accentColor / computed text tone</code></article></div></div>
      </section>
    </>
  );
}
