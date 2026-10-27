import { home, homeBandsUi } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import ServiceTile from "@/components/ui/ServiceTile";
import Section from "./Section";

/** Bento layout: large equity tile, two stacked tiles beside it, one wide tile across the bottom. */
const LAYOUT = [
  { cls: "lg:col-span-7 lg:row-span-2", variant: "tall" },
  { cls: "lg:col-span-5", variant: "default" },
  { cls: "lg:col-span-5", variant: "default" },
  { cls: "lg:col-span-12", variant: "wide" },
] as const;

export default function Services() {
  const s = home.services;
  const ui = homeBandsUi.services;
  return (
    <Section scene="ServiceTiles" labelledBy="services-h" className="section-y">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-70" />
        <div className="absolute left-[55%] top-[30%] h-[520px] w-[min(720px,90vw)] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
      </div>
      <div className="container-x">
        <Reveal>
          <p className="section-index">
            {ui.index} — {ui.label}
          </p>
          <h2 id="services-h" className="h2 text-gradient mt-6 max-w-[18ch] pb-1">
            {s.heading}
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:mt-16 lg:grid-cols-12">
          {s.tiles.map((t, i) => {
            const l = LAYOUT[i] ?? LAYOUT[1];
            return (
              <Reveal key={t.href} delay={i * 0.07} className={`h-full ${l.cls} ${l.variant === "wide" || l.variant === "tall" ? "md:col-span-2" : ""}`}>
                <ServiceTile title={t.title} body={t.body} href={t.href} kind={t.kind} index={i} variant={l.variant} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
