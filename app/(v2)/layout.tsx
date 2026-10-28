import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { company, nav } from "@/content/copy";
import Nav from "@/components/v2/ui/Nav";
import Footer from "@/components/v2/ui/Footer";
import ConsentBanner from "@/components/v2/ui/ConsentBanner";
import VersionSwitch from "@/components/VersionSwitch";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["600"], variable: "--font-inter-tight", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: { default: company.titleSuffix, template: `%s | ${company.titleSuffix}` },
  alternates: { canonical: "/" },
  // The Clean design mirrors the Classic pages; keep it out of search results (pages canonicalise to the Classic URLs).
  robots: { index: false, follow: true },
};

export const viewport: Viewport = { themeColor: "#FFFFFF" };

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
    <html lang="en-SG" className={`${inter.variable} ${interTight.variable}`}>
      <body>
        <a href="#main" className="skip-link">{nav.skip}</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ConsentBanner />
        <VersionSwitch />
      </body>
    </html>
  );
}
