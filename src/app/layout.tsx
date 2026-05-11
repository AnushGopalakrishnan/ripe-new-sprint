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
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/PlantinMTProLight.TTF" as="font" type="font/ttf" crossOrigin="" />
        <link rel="preload" href="/fonts/GraphikRegular.otf" as="font" type="font/otf" crossOrigin="" />
        <link rel="preload" href="/fonts/ChivoMono-Regular.ttf" as="font" type="font/ttf" crossOrigin="" />
        <style
          data-ripe-critical-hero-cards=""
          dangerouslySetInnerHTML={{
            __html:
              ".article-cards-wrap.u-align-center{width:100%}.hero_feature,.hero_articles-list{width:100%}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
