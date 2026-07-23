import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Honami — Studio & Journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #FBFAF6 0%, #F7F4ED 55%, #EDE6D8 100%)",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", color: "#9C8873", fontSize: 24, letterSpacing: 6 }}>
          <span>STUDIO · JOURNAL</span>
          <span>EST. 2019</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, color: "#3B372F", fontStyle: "italic", lineHeight: 1 }}>Honami</div>
          <div style={{ marginTop: 24, fontSize: 34, color: "#6B6559" }}>
            Illustration · Handmade · Slow Living
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#9C8873", fontSize: 24 }}>
          <span>A lifestyle-editorial portfolio</span>
          <div style={{ display: "flex", width: 56, height: 56, borderRadius: 12, border: "2px solid #C6A868", alignItems: "center", justifyContent: "center", fontSize: 34, color: "#3B372F", fontStyle: "italic" }}>
            H
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
