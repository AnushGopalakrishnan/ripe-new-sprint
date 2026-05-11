import { PageTransitionController } from "@/components/page-transition-controller";

export default function SiteTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PageTransitionController />
      {children}
    </>
  );
}
