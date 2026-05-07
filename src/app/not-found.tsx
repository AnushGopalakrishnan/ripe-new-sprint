import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section">
      <div className="page-grid">
        <div
          className="card-surface"
          style={{ padding: "2rem", display: "grid", gap: "1rem" }}
        >
          <span className="eyebrow">404</span>
          <h1 className="section-title">That page did not make the cut.</h1>
          <p className="lede">
            The route is missing, moved, or waiting to be rebuilt as part of the
            migration.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button-link" href="/">
              Back Home
            </Link>
            <Link className="outline-link" href="/case-studies">
              Browse Case Studies
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
