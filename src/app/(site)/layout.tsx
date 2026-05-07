import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/content";
import styles from "@/app/(site)/site-layout.module.css";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const isDraftMode = (await draftMode()).isEnabled;

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className={styles.shell}>
        <SiteHeader nav={settings.nav} />
        <main id="main-content" className={styles.main}>
          {children}
        </main>
        <SiteFooter
          contactEmail={settings.contactEmail || ""}
          footerNav={settings.footerNav}
          location={settings.location || ""}
          socialLinks={settings.socialLinks || []}
        />
      </div>
      {isDraftMode ? (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      ) : null}
    </>
  );
}
