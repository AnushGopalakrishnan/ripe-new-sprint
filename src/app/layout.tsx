import type { Metadata } from "next";
import { RipeHeadAssets } from "@/components/ripe-head-assets";
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
        <RipeHeadAssets />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
