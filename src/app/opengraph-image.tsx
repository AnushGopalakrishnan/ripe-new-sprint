import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "linear-gradient(135deg, #fcf7f0 0%, #eedec8 52%, #d9e8de 100%)",
          color: "#14121a",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Ripe Studios
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 0.95,
              letterSpacing: -5,
              maxWidth: 900,
            }}
          >
            Custom marketing systems with editorial range.
          </div>
          <div style={{ fontSize: 30, color: "#4f485a", maxWidth: 780 }}>
            Next.js, Sanity, preview workflows, and interaction-aware page
            architecture.
          </div>
        </div>
      </div>
    ),
    size
  );
}
