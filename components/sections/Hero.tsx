import { heroUi, home } from "@/content/copy";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import HeroPanels from "@/components/hero/HeroPanels";
import Section from "./Section";

export default function Hero() {
  const h = home.hero;
  // "Intelligence, held to account." -> lead + accent clause (text unchanged, only styled)
  const cut = h.h1.indexOf(", ");
  const lead = cut > 0 ? h.h1.slice(0, cut + 1) : h.h1;
  const tail = cut > 0 ? h.h1.slice(cut + 2) : "";

  return (
    <Section scene="SignalField" labelledBy="hero-h" scrim={false} className="flex min-h-[100svh] flex-col overflow-hidden">
      {/* depth layers: blueprint grid, readability scrim (left on desktop, top on mobile), bottom fade into the strip */}
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,8,11,0.88)_0%,rgba(6,8,11,0.72)_55%,rgba(6,8,11,0.15)_80%,rgba(6,8,11,0.5)_100%)] lg:bg-[linear-gradient(90deg,rgba(6,8,11,0.94)_0%,rgba(6,8,11,0.82)_30%,rgba(6,8,11,0.35)_52%,rgba(6,8,11,0)_68%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-bg" />

      <div className="container-x relative flex flex-1 flex-col justify-center pb-14 pt-28 lg:pb-20 lg:pt-32">
        <div className="grid grid-cols-12 items-end gap-y-12 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <p className="eyebrow inline-flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] text-text/80 backdrop-blur-sm">
                <span className="live-dot shrink-0" aria-hidden="true" />
                <span className="min-w-0">{h.eyebrow}</span>
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 id="hero-h" className="h1 mt-8 max-w-[13ch] pb-2">
                <span className="text-gradient">{lead}</span>
                {tail ? (
                  <>
                    <br />
                    <span className="text-gradient-accent">{tail}</span>
                  </>
                ) : null}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-[56ch] text-[17px] leading-relaxed text-text/90 md:text-[19px]">{h.sub}</p>
              <p className="mt-4 max-w-[60ch] border-l border-accent/60 pl-4 text-[15px] text-muted md:text-[16px]">
                {h.supporting}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href={h.ctaPrimary.href}>{h.ctaPrimary.label}</Button>
                <Button href={h.ctaSecondary.href} variant="secondary">
                  {h.ctaSecondary.label}
                </Button>
              </div>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:pb-2">
            <Reveal delay={0.25}>
              <HeroPanels />
            </Reveal>
          </div>
        </div>
      </div>

      <div className="container-x relative hidden pb-8 md:block">
        <div className="hairline mb-5" />
        <div className="flex items-center justify-between">
          <span className="section-index">01 — {heroUi.scroll}</span>
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-muted">{heroUi.envelope}</span>
        </div>
      </div>
    </Section>
  );
}
