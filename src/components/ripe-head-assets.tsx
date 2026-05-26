export function RipeHeadAssets() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="shortcut icon" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/webclip.svg" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must stay render-blocking for visual parity. */}
      <link rel="stylesheet" href="/css/normalize.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must stay render-blocking for visual parity. */}
      <link rel="stylesheet" href="/css/webflow.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must stay render-blocking for visual parity. */}
      <link rel="stylesheet" href="/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Vendored loader styles are part of the mirrored visual shell. */}
      <link rel="stylesheet" href="/vendor/ripe/styles/global/components.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Vendored loader styles are part of the mirrored visual shell. */}
      <link rel="stylesheet" href="/vendor/ripe/styles/global/theme.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Vendored loader styles are part of the mirrored visual shell. */}
      <link rel="stylesheet" href="/vendor/ripe/styles/global/card-hover.css" />
      <link rel="preload" href="/fonts/PlantinMTProLight.TTF" as="font" type="font/ttf" crossOrigin="" />
      <link rel="preload" href="/fonts/GraphikRegular.otf" as="font" type="font/otf" crossOrigin="" />
      <link rel="preload" href="/fonts/ChivoMono-Regular.ttf" as="font" type="font/ttf" crossOrigin="" />
      <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
      <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      <style
        data-ripe-critical-hero-cards=""
        dangerouslySetInnerHTML={{
          __html: ".article-cards-wrap.u-align-center{width:100%}.hero_feature,.hero_articles-list{width:100%}",
        }}
      />
    </>
  );
}
