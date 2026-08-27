import { ImageResponse } from "next/og";

export const alt =
  "MDT07 Visual Reference — public Pinterest Boards for web design research";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "#f8f7f3",
          color: "#1d1c1a",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            gap: 18,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#a32b2b",
              borderRadius: 18,
              color: "#fffefa",
              display: "flex",
              height: 64,
              justifyContent: "center",
              width: 64,
            }}
          >
            M7
          </div>
          MDT07 Visual Reference
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#a32b2b",
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Visual research for the web
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.08,
              maxWidth: 980,
            }}
          >
            Explore public Pinterest Boards as clear, source-linked visual references.
          </div>
        </div>
      </div>
    ),
    size
  );
}
