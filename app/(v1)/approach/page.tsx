import type { Metadata } from "next";
import { approach, home, misc, pagesUi } from "@/content/copy";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/sections/Section";
import Principles from "@/components/sections/Principles";
import Pipeline from "@/components/sections/Pipeline";
import Closing from "@/components/sections/Closing";
import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Panel from "@/components/pages/Panel";
import Icon, { type IconKind } from "@/components/pages/Icons";

export const metadata: Metadata = {
  title: approach.title,
  description: approach.intro,
  alternates: { canonical: "/approach" },
};

const pad = (n: number) => String(n).padStart(2, "0");
const GATES = new Set<string>(["Backtesting", "Risk controls"]);
const CARD_ICONS: IconKind[] = ["stack", "algo", "code"];

function PipelinePanel() {
  const p = home.pipeline;
  return (
    <Panel
      title={pagesUi.pipeline}
      right={<span className="mono text-[11px] text-muted">{pad(p.stages.length)}</span>}
      bodyClassName="px-5 py-4"
      footer={<p className="text-[13px] leading-snug text-muted">{misc.pipelineReviewNote}</p>}
    >
      <ol className="relative">
        <span aria-hidden="true" className="absolute bottom-6 left-[15px] top-4 w-px bg-gradient-to-b from-accent/70 via-white/15 to-signal/60" />
        {p.stages.map((s, i) => {
          const gate = GATES.has(s);
          return (
            <li key={s} className="relative flex items-center gap-4 py-2">
              <span
                className={`mono relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10.5px] ${
                  gate ? "border-caution/70 bg-[#1a1408] text-caution" : "border-white/15 bg-surface text-text/80"
                }`}
              >
                {pad(i + 1)}
              </span>
              <span className="flex-1 text-[15px] text-text">{s}</span>
              {gate ? (
                <span className="mono rounded border border-caution/50 bg-caution/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-caution">
                  {p.gateLabel}
                </span>
              ) : null}
            </li>
          );
        })}
        <li className="relative flex items-center gap-4 py-2">
          <span className="mono relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-signal/70 bg-surface text-[14px] text-signal" aria-hidden="true">
            ↺
          </span>
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-signal">{p.loop}</span>
        </li>
      </ol>
    </Panel>
  );
}

export default function ApproachPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: approach.title, path: "/approach" }]} />
      <PageHero
        scene="Bounded"
        title={approach.h1}
        sub={approach.intro}
        crumbs={[{ label: approach.title, href: "/approach" }]}
        aside={<PipelinePanel />}
        sceneBand
      />
      <Section className="py-20 lg:py-28">
        <div className="container-x">
          <ol className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {approach.paragraphs.map((p, i) => (
              <li key={p.heading}>
                <Reveal delay={i * 0.07} className="h-full">
                  <Spotlight className="panel group relative flex h-full min-h-[340px] flex-col overflow-hidden p-7 md:p-9">
                    <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
                    <div className="relative flex items-start justify-between">
                      <span className="mono text-[13px] tracking-[0.14em] text-accent">{pad(i + 1)}</span>
                      <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-text/85">
                        <Icon kind={CARD_ICONS[i] ?? "stack"} className="h-7 w-7" />
                      </span>
                    </div>
                    <div className="relative pt-20">
                      <h2 className="font-display text-[clamp(28px,2.6vw,38px)] leading-[1.05] tracking-[-0.035em]">{p.heading}</h2>
                      <div aria-hidden="true" className="my-5 h-px w-10 bg-accent transition-all duration-500 group-hover:w-20" />
                      <p className="text-[16px] leading-relaxed text-muted md:text-[17px]">{p.body}</p>
                    </div>
                  </Spotlight>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>
      <Principles heading={approach.principlesHeading} id="approach-principles-h" />
      <Pipeline heading={approach.pipelineHeading} note={misc.pipelineReviewNote} id="approach-pipeline-h" />
      <Closing />
    </>
  );
}
