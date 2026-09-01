import type { Metadata } from "next";
import { publicComponentDefinitions } from "@/components/component-system/registry";
import type { PublicComponentCategory } from "@/components/component-system/registry";
import { CategoryIndex } from "../category-index";
import { SpecimenStage } from "./specimen-stage";
import styles from "../component-system.module.css";

export const metadata: Metadata = { title: "Components" };

const categories: PublicComponentCategory[] = ["Global", "Collections", "Case studies", "Media", "People"];
const categoryId = (category: PublicComponentCategory) => category.toLowerCase().replaceAll(" ", "-");

export default function ComponentSystemComponentsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Shared source / Production React</p>
          <h1 className={styles.pageTitle}>Components</h1>
        </div>
        <p className={styles.pageIntro}>Only shared React components imported by current public routes are included below.</p>
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
              <article className={styles.specimen} id={id} key={id} data-component-specimen={id}>
                <header className={styles.specimenHeader}>
                  <div><span className={styles.eyebrow}>{category}</span><h3>{name}</h3></div>
                  <p>{description}</p>
                  <div className={styles.variants} aria-label={`${name} variants`}>{variants.map((variant) => <span className={styles.variant} key={variant}>{variant}</span>)}</div>
                </header>
                <SpecimenStage id={id} name={name} sourcePath={sourcePath} />
              </article>
            ))}
          </section>
        );
      })}
    </>
  );
}
