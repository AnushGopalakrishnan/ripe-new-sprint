export default function SiteTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div data-page-transition-container="">{children}</div>;
}
