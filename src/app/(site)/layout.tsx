import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { EditorBridgeRuntime } from "@/components/editor-bridge-runtime";
import { PageTransitionController } from "@/components/page-transition-controller";
import { PublicNavigation } from "@/components/public-navigation";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { getSiteSettings } from "@/lib/content";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDraftMode = (await draftMode()).isEnabled;
  const siteSettings = await getSiteSettings();

  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="shortcut icon" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/webclip.svg" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must stay route-scoped to public site pages. */}
      <link rel="stylesheet" href="/css/normalize.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must stay route-scoped to public site pages. */}
      <link rel="stylesheet" href="/css/webflow.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must stay route-scoped to public site pages. */}
      <link rel="stylesheet" href="/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Local visual editor applies generated style drafts here during development. */}
      <link rel="stylesheet" href="/editor-patches.css" />
      <style
        data-ripe-critical-hero-cards=""
        dangerouslySetInnerHTML={{
          __html:
            ".article-cards-wrap.u-align-center{width:100%}.hero_feature,.hero_articles-list{width:100%}.nav_wrap,.nav_contain.u-container{display:none!important}",
        }}
      />
      <SmoothScrollProvider />
      <PageTransitionController />
      <PublicNavigation
        contactEmail={siteSettings.contactEmail}
        navLinks={siteSettings.nav}
        navigationShowreel={siteSettings.navigationShowreel}
        socialLinks={siteSettings.socialLinks}
      />
      {children}
      <EditorBridgeRuntime />
      {isDraftMode ? (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      ) : null}
    </>
  );
}
