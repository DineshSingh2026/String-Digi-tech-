import type { Metadata } from "next";
import { home } from "@/content/copy";
import Hero from "@/components/v2/home/Hero";
import Intro from "@/components/v2/home/Intro";
import Services from "@/components/v2/home/Services";
import RiskFirst from "@/components/v2/home/RiskFirst";
import Pipeline from "@/components/v2/home/Pipeline";
import FeatureRows from "@/components/v2/home/FeatureRows";
import Principles from "@/components/v2/home/Principles";
import Why from "@/components/v2/home/Why";
import Singapore from "@/components/v2/home/Singapore";
import ClosingCta from "@/components/v2/home/ClosingCta";

export const metadata: Metadata = {
  description: home.hero.sub,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <Services />
      <RiskFirst />
      <Pipeline />
      <FeatureRows />
      <Principles />
      <Why />
      <Singapore />
      <ClosingCta />
    </>
  );
}
