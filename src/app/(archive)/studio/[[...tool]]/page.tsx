import { NextStudio } from "next-sanity/studio";
import { metadata, viewport } from "next-sanity/studio";
import config from "../../../../../sanity.config";
import { hasSanityConfig } from "@/lib/env";

export const dynamic = "force-static";

export { metadata, viewport };

export default function StudioPage() {
  if (!hasSanityConfig) {
    return (
      <main className="section">
        <div className="page-grid">
          <div
            className="card-surface"
            style={{ display: "grid", gap: "1rem", padding: "2rem" }}
          >
            <span className="eyebrow">Studio Setup Required</span>
            <h1 className="section-title">Add Sanity environment variables first.</h1>
            <p className="lede">
              Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>,{" "}
              <code>NEXT_PUBLIC_SANITY_DATASET</code>, and{" "}
              <code>SANITY_API_READ_TOKEN</code> to activate the embedded Studio
              and preview workflow.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
