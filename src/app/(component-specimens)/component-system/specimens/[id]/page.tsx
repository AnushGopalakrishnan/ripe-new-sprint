import type { Metadata } from "next";
import "dialkit/styles.css";
import { notFound } from "next/navigation";
import {
  publicComponentIds,
  publicComponentRegistry,
} from "@/components/component-system/registry";
import type { PublicComponentId } from "@/components/component-system/registry";
import { SpecimenMount } from "./specimen-mount";
import styles from "./specimen.module.css";

export const metadata: Metadata = {
  title: "Component specimen",
  robots: { index: false, follow: false },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return publicComponentIds.map((id) => ({ id }));
}

function isPublicComponentId(value: string): value is PublicComponentId {
  return publicComponentIds.some((id) => id === value);
}

export default async function ComponentSpecimenPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!isPublicComponentId(id)) notFound();
  const definition = publicComponentRegistry[id];

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags -- Isolated specimens load the exact exported public CSS. */}
      <link rel="stylesheet" href="/css/normalize.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Isolated specimens load the exact exported public CSS. */}
      <link rel="stylesheet" href="/css/webflow.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags -- Isolated specimens load the exact exported public CSS. */}
      <link rel="stylesheet" href="/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css" />
      <main className={styles.surface} data-component={id} data-component-specimen-align={definition.surfaceAlignment} data-component-specimen-page="">
        <SpecimenMount id={id} />
      </main>
    </>
  );
}
