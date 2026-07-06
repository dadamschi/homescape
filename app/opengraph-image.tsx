import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Homescape Construction - Chicago Home Builder & Remodeling";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #f8faf5 0%, #eef4e5 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Logo circle */}
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          border: "6px solid #9ab523",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 300,
              color: "#9ab523",
              letterSpacing: "0.02em",
            }}
          >
            homescape
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#333",
              letterSpacing: "0.05em",
              marginTop: -4,
            }}
          >
            construction inc.
          </span>
        </div>
      </div>

      {/* Main heading */}
      <h1
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#1a1a1a",
          margin: 0,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        Chicago Home Builder
      </h1>

      {/* Subheading */}
      <p
        style={{
          fontSize: 28,
          color: "#666",
          margin: "16px 0 0 0",
          textAlign: "center",
        }}
      >
        Custom Homes &bull; Remodeling &bull; Renovations
      </p>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 60,
          marginTop: 48,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#9ab523" }}>200+</span>
          <span style={{ fontSize: 16, color: "#666" }}>Projects</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#9ab523" }}>13+</span>
          <span style={{ fontSize: 16, color: "#666" }}>Years</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#9ab523" }}>98%</span>
          <span style={{ fontSize: 16, color: "#666" }}>Satisfaction</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
