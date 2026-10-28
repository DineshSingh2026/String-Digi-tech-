import type { Metadata } from "next";
import { home } from "@/content/copy";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionHeading from "@/components/ui/SectionHeading";
import SimLabel from "@/components/ui/SimLabel";
import StatReadout from "@/components/ui/StatReadout";
import DisclaimerBlock from "@/components/ui/DisclaimerBlock";
import PrincipleRow from "@/components/ui/PrincipleRow";
import PipelineStage from "@/components/ui/PipelineStage";
import ServiceTile from "@/components/ui/ServiceTile";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "UI lab", robots: { index: false, follow: false } };

export default function UiLab() {
  const tile = home.services.tiles[0];
  return (
    <div className="container-x flex flex-col gap-16 bg-bg pb-24 pt-32">
      <SectionHeading eyebrow={home.hero.eyebrow} title={home.hero.h1}>
        {home.hero.sub}
      </SectionHeading>
      <div className="flex flex-wrap gap-3">
        <Button href={home.hero.ctaPrimary.href}>{home.hero.ctaPrimary.label}</Button>
        <Button href={home.hero.ctaSecondary.href} variant="secondary">
          {home.hero.ctaSecondary.label}
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <Eyebrow>{home.dataStrip.readouts.ticks}</Eyebrow>
        <SimLabel />
        <div className="flex flex-wrap gap-10">
          <StatReadout label={home.dataStrip.readouts.ticks} value="1,284" tone="signal" />
          <StatReadout label={home.dataStrip.readouts.latency} value="3.2" unit="ms" tone="caution" />
          <StatReadout label={home.dataStrip.readouts.heartbeat} value="OK" />
        </div>
      </div>
      <DisclaimerBlock />
      <div>
        {home.principles.items.map((t, i) => (
          <PrincipleRow key={t} index={i} text={t} />
        ))}
      </div>
      <ol className="flex gap-6 overflow-x-auto">
        {home.pipeline.stages.map((s, i) => (
          <PipelineStage key={s} index={i} label={s} gate={i === 2 || i === 3} gateLabel={home.pipeline.gateLabel} />
        ))}
      </ol>
      <Reveal className="max-w-[560px]">
        <ServiceTile title={tile.title} body={tile.body} href={tile.href} kind={tile.kind} />
      </Reveal>
    </div>
  );
}
