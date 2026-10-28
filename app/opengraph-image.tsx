import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { company, home } from "@/content/copy";

export const alt = company.titleSuffix;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-full.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          padding: 80,
          color: "#0F1720",
          borderBottom: "12px solid #C2410C",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={290} height={80} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 96, height: 6, background: "#C2410C", marginBottom: 36, borderRadius: 3 }} />
          <div style={{ fontSize: 80, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05 }}>{home.hero.h1}</div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#5F6B7A" }}>{home.hero.eyebrow}</div>
        </div>
      </div>
    ),
    size,
  );
}
