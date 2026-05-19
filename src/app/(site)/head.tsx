export default function SiteHead() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must be render-blocking to preserve first-paint parity on mirrored site routes. */}
      <link rel="stylesheet" href="/css/normalize.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must be render-blocking to preserve first-paint parity on mirrored site routes. */}
      <link rel="stylesheet" href="/css/webflow.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must be render-blocking to preserve first-paint parity on mirrored site routes. */}
      <link rel="stylesheet" href="/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css" />
      <style
        data-ripe-critical-hero-cards=""
        dangerouslySetInnerHTML={{
          __html: ".article-cards-wrap.u-align-center{width:100%}.hero_feature,.hero_articles-list{width:100%}",
        }}
      />
    </>
  );
}
