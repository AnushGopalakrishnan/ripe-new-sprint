import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { PageTransitionController } from "@/components/page-transition-controller";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDraftMode = (await draftMode()).isEnabled;

  return (
    <>
      <SmoothScrollProvider />
      <PageTransitionController />
      {children}
      {isDraftMode ? (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      ) : null}
    </>
  );
}
