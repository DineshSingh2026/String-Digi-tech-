import type { Metadata } from "next";
import { home } from "@/content/copy";
import Hero from "@/components/sections/Hero";
import DataStripBand from "@/components/sections/DataStripBand";
import Services from "@/components/sections/Services";
import RiskFirst from "@/components/sections/RiskFirst";
import Pipeline from "@/components/sections/Pipeline";
import Analytics from "@/components/sections/Analytics";
import Infrastructure from "@/components/sections/Infrastructure";
import Software from "@/components/sections/Software";
import Principles from "@/components/sections/Principles";
import Why from "@/components/sections/Why";
import Singapore from "@/components/sections/Singapore";
import Closing from "@/components/sections/Closing";

export const metadata: Metadata = {
  description: home.hero.sub,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <DataStripBand />
      <Services />
      <RiskFirst />
      <Pipeline />
      <Analytics />
      <Infrastructure />
      <Software />
      <Principles />
      <Why />
      <Singapore />
      <Closing />
    </>
  );
}
