import type { Metadata } from "next";
import { publicComponentDefinitions } from "@/components/component-system/registry";
import type { PublicComponentCategory } from "@/components/component-system/registry";
import { CategoryIndex } from "../category-index";
import { ComponentCatalogueEntry } from "./component-catalogue-entry";
import styles from "../component-system.module.css";

export const metadata: Metadata = { title: "Components" };

const categories: PublicComponentCategory[] = ["Atoms", "Molecules", "Cards", "Compositions"];
const categoryId = (category: PublicComponentCategory) => category.toLowerCase().replaceAll(" ", "-");

export default function ComponentSystemComponentsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Shared source / Production React</p>
          <h1 className={styles.pageTitle}>Components</h1>
        </div>
        <p className={styles.pageIntro}>Production atoms, molecules, cards and compositions imported by current public routes. Every specimen renders the same typed source used by the live site.</p>
      </header>
      <CategoryIndex
        items={categories.map((category) => ({ id: categoryId(category), label: category }))}
        label="Component categories"
      />
      {categories.map((category) => {
        const definitions = publicComponentDefinitions.filter((definition) => definition.category === category);
        return (
          <section className={styles.componentGroup} id={categoryId(category)} key={category}>
            <header>
              <h2>{category}</h2>
            </header>
            {definitions.map(({ id, name, description, sourcePath, variants }) => (
              <ComponentCatalogueEntry
                category={category}
                description={description}
                id={id}
                key={id}
                name={name}
                sourcePath={sourcePath}
                variants={variants}
              />
            ))}
          </section>
        );
      })}
    </>
  );
}
