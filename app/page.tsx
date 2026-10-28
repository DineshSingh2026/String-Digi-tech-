import type { Metadata } from "next";
import { home } from "@/content/copy";
import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Services from "@/components/home/Services";
import RiskFirst from "@/components/home/RiskFirst";
import Pipeline from "@/components/home/Pipeline";
import FeatureRows from "@/components/home/FeatureRows";
import Principles from "@/components/home/Principles";
import Why from "@/components/home/Why";
import Singapore from "@/components/home/Singapore";
import ClosingCta from "@/components/home/ClosingCta";

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
