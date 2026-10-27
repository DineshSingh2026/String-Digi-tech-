import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { company, nav } from "@/content/copy";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SceneCanvas from "@/scenes/engine/SceneCanvas";
import ConsentBanner from "@/components/ui/ConsentBanner";
import SmoothScroll from "@/components/ui/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["600"], variable: "--font-inter-tight", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: { default: company.titleSuffix, template: `%s | ${company.titleSuffix}` },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#06080B" };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.wordmark,
  legalName: company.legalName,
  identifier: company.uen,
  url: company.url,
  logo: `${company.url}/brand/logo-full.png`,
  address: { "@type": "PostalAddress", ...company.addressParts },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={`${inter.variable} ${interTight.variable} ${jetbrains.variable}`}>
      <body>
        <a href="#main" className="skip-link">{nav.skip}</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <SceneCanvas />
        <SmoothScroll />
        <Nav />
        <main id="main" className="relative z-10">{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  );
}
