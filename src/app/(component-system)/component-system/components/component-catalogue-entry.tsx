"use client";

import { useState } from "react";
import type {
  PublicComponentCategory,
  PublicComponentId,
} from "@/components/component-system/registry";
import { ComponentIdCopy } from "./component-id-copy";
import { SpecimenStage } from "./specimen-stage";
import styles from "../component-system.module.css";

export function ComponentCatalogueEntry({
  category,
  description,
  id,
  name,
  sourcePath,
  variants,
}: Readonly<{
  category: PublicComponentCategory;
  description: string;
  id: PublicComponentId;
  name: string;
  sourcePath: string;
  variants: readonly string[];
}>) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0] ?? "default");

  return (
    <article className={styles.specimen} id={id} data-component-specimen={id}>
      <header className={styles.specimenHeader}>
        <div>
          <div className={styles.componentPath}>
            <span>{category}</span>
            <ComponentIdCopy id={id} />
          </div>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
        <div className={styles.variants} aria-label={`${name} variants`}>
          {variants.map((variant) => (
            <button
              aria-pressed={selectedVariant === variant}
              className={styles.variant}
              key={variant}
              onClick={() => setSelectedVariant(variant)}
              type="button"
            >
              {variant}
            </button>
          ))}
        </div>
      </header>
      <SpecimenStage
        category={category}
        id={id}
        name={name}
        selectedVariant={selectedVariant}
        sourcePath={sourcePath}
      />
    </article>
  );
}
