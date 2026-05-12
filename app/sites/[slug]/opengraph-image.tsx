import { ImageResponse } from "next/og";
import { loadSiteData } from "@/lib/sites/data";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Next Level Sites";

/**
 * Dynamische OG-image per slug. Wordt opgepakt door social-media platforms
 * (WhatsApp, iMessage, Slack, LinkedIn, Twitter) wanneer de URL gedeeld wordt.
 * Cinematic donker met serif-titel + locatie + tagline.
 */
export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const result = await loadSiteData(params.slug);
  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#f5f0e6",
            fontSize: 48,
            fontFamily: "serif",
          }}
        >
          Next Level Sites
        </div>
      ),
      size
    );
  }
  const { business } = result.data;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #2a1c10 100%)",
          color: "#f5f0e6",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            opacity: 0.55,
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          {business.city} · {business.vertical}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 108,
              lineHeight: 1,
              letterSpacing: -2,
              fontWeight: 300,
            }}
          >
            {business.name}
          </div>
          <div
            style={{
              fontSize: 30,
              opacity: 0.7,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {business.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            opacity: 0.5,
            fontFamily: "monospace",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <span>{business.address?.formatted ?? ""}</span>
          <span>Next Level Sites</span>
        </div>
      </div>
    ),
    size
  );
}
