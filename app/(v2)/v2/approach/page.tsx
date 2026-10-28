import type { Metadata } from "next";
import { approach, home, misc, nav, v2Pages } from "@/content/copy";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionHeading from "@/components/v2/ui/SectionHeading";
import PageHero from "@/components/v2/PageHero";
import CtaBand from "@/components/v2/CtaBand";
import { LoopIcon } from "@/components/v2/icons";

const PATH = "/approach";

export const metadata: Metadata = {
  title: approach.title,
  description: approach.intro,
  alternates: { canonical: PATH },
};

// Stages held at a human review gate.
const GATES = new Set<string>(["Backtesting", "Risk controls"]);
const pad = (n: number) => String(n).padStart(2, "0");

function ReviewBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-semibold text-accent">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
      {v2Pages.approach.reviewBadge}
    </span>
  );
}

export default function ApproachPage() {
  const stages = home.pipeline.stages;
  return (
    <>
      <Breadcrumbs items={[{ name: approach.title, path: PATH }]} />
      <PageHero
        crumbs={[{ label: approach.title, href: PATH }]}
        eyebrow={v2Pages.approach.eyebrow}
        title={approach.h1}
        sub={approach.intro}
        primary={{ label: nav.contact.label, href: nav.contact.href }}
        image={{ src: "/images/meeting-notes.jpg", alt: v2Pages.alt.approach }}
      />

      {/* AI across the three practice areas */}
      <section aria-labelledby="pillars-h" className="section-y bg-surface">
        <div className="container-x">
          <SectionHeading eyebrow={v2Pages.approach.pillarsEyebrow} title={v2Pages.approach.pillarsTitle} id="pillars-h" />
          <ul className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16">
            {approach.paragraphs.map((p, i) => (
              <li key={p.heading} className="card flex flex-col p-8">
                <span className="num text-[13px] font-semibold text-accent">{pad(i + 1)}</span>
                <h3 className="h3 mt-6">{p.heading}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-body">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Principles */}
      <section aria-labelledby="principles-h" className="section-y bg-bg">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={approach.principlesHeading} title={v2Pages.approach.principlesTitle} id="principles-h" />
          </div>
          <ol className="border-b border-line lg:col-span-7">
            {home.principles.items.map((item, i) => (
              <li key={item} className="flex items-baseline gap-6 border-t border-line py-7 md:gap-10 md:py-8">
                <span className="num w-8 shrink-0 font-display text-[15px] font-semibold text-accent">{pad(i + 1)}</span>
                <span className="font-display text-[clamp(20px,1.9vw,26px)] font-semibold leading-snug tracking-[-0.015em] text-text">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Strategy lifecycle */}
      <section aria-labelledby="pipeline-h" className="section-y bg-surface">
        <div className="container-x">
          <SectionHeading eyebrow={v2Pages.approach.pipelineEyebrow} title={approach.pipelineHeading} id="pipeline-h" />

          <div className="card mt-12 p-6 md:p-10 lg:mt-16">
            <ol className="relative grid gap-0 lg:grid-cols-6 lg:gap-6">
              {stages.map((stage, i) => {
                const gate = GATES.has(stage);
                const last = i === stages.length - 1;
                return (
                  <li key={stage} className="relative flex gap-5 pb-8 last:pb-0 lg:flex-col lg:gap-0 lg:pb-0">
                    {/* connector */}
                    {!last ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-[19px] top-10 bottom-0 w-px bg-line lg:left-10 lg:right-[-24px] lg:top-[19px] lg:bottom-auto lg:h-px lg:w-auto"
                      />
                    ) : null}
                    <span
                      className={`num relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-semibold ${
                        gate ? "bg-accent text-white" : "border border-line bg-white text-text"
                      }`}
                    >
                      {pad(i + 1)}
                    </span>
                    <div className="pt-2 lg:pt-5">
                      <p className="font-display text-[17px] font-semibold leading-snug text-text">{stage}</p>
                      {gate ? (
                        <div className="mt-2.5">
                          <ReviewBadge />
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-[15px] text-muted md:flex-row md:items-center md:justify-between md:gap-8">
              <p className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-text">
                  <LoopIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="font-semibold capitalize text-text">{home.pipeline.loop}</span>
                  <span aria-hidden="true"> · </span>
                  {v2Pages.approach.refineNote}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <ReviewBadge />
                <span>{misc.pipelineReviewNote}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
