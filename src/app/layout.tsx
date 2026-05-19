import type { Metadata } from "next";
import { defaultMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must be render-blocking to preserve first-paint parity on mirrored routes. */}
        <link rel="stylesheet" href="/css/normalize.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must be render-blocking to preserve first-paint parity on mirrored routes. */}
        <link rel="stylesheet" href="/css/webflow.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags -- Exported CSS must be render-blocking to preserve first-paint parity on mirrored routes. */}
        <link
          rel="stylesheet"
          href="/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css"
        />
        <link rel="preload" href="/fonts/PlantinMTProLight.TTF" as="font" type="font/ttf" crossOrigin="" />
        <link rel="preload" href="/fonts/GraphikRegular.otf" as="font" type="font/otf" crossOrigin="" />
        <link rel="preload" href="/fonts/ChivoMono-Regular.ttf" as="font" type="font/ttf" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://cdn.prod.website-files.com" />
        <link rel="dns-prefetch" href="https://cdn.prod.website-files.com" />
        <link rel="preconnect" href="https://framerusercontent.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://framerusercontent.com" />
        <link rel="preconnect" href="https://ena-supply.b-cdn.net" />
        <link rel="dns-prefetch" href="https://ena-supply.b-cdn.net" />
        <style
          data-ripe-critical-hero-cards=""
          dangerouslySetInnerHTML={{
            __html:
              ".article-cards-wrap.u-align-center{width:100%}.hero_feature,.hero_articles-list{width:100%}",
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
