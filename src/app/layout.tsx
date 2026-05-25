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
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
