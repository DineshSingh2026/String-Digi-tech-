import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./(v1)/globals.css";
import { notFound as copy } from "@/content/copy";
import Logo from "@/components/ui/Logo";

// Served for URLs that match neither design (see experimental.globalNotFound in next.config.mjs).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["600"], variable: "--font-inter-tight", display: "swap" });

export const metadata: Metadata = { title: copy.h1 };

export default function GlobalNotFound() {
  return (
    <html lang="en-SG" className={`${inter.variable} ${interTight.variable}`}>
      <body>
        <main className="container-x flex min-h-[100svh] flex-col items-start justify-center gap-6 py-24">
          <Logo variant="full" height={40} />
          <p className="eyebrow mt-10">{copy.eyebrow}</p>
          <h1 className="h1">{copy.h1}</h1>
          <p className="prose-body text-muted">{copy.body}</p>
          <a href={copy.cta.href} className="mt-4 inline-flex h-12 items-center rounded-lg bg-accent px-6 font-medium text-black">
            {copy.cta.label} →
          </a>
        </main>
      </body>
    </html>
  );
}
