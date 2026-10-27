"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { home, homeBandsUi, misc, pagesUi, pipelineUi } from "@/content/copy";
import SimLabel from "@/components/ui/SimLabel";
import PipelineDiagram from "@/components/pipeline/PipelineDiagram";
import Section from "./Section";

const GATE_NAMES = new Set<string>(["Backtesting", "Risk controls"]);
const STAGES = home.pipeline.stages;
const GATES: readonly number[] = STAGES.map((s, i) => (GATE_NAMES.has(s) ? i : -1)).filter((i) => i >= 0);

type Props = { heading?: string; note?: string; id?: string };

function Legend({ className = "" }: { className?: string }) {
  const l = pipelineUi.legend;
  return (
    <span className={`mono items-center gap-5 text-[10px] uppercase tracking-[0.14em] text-muted ${className}`}>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-text shadow-[0_0_8px_rgba(233,238,243,0.8)]" />
        {l.flow}
      </span>
      <span className="inline-flex items-center gap-2 text-caution/90">
        <span aria-hidden="true" className="h-[10px] w-[10px] rounded-full border-[1.5px] border-dashed border-caution" />
        {l.gate}
      </span>
      <span className="inline-flex items-center gap-2 text-signal/90">
        <span aria-hidden="true">↺</span>
        {l.refine}
      </span>
    </span>
  );
}

export default function Pipeline({ heading = home.pipeline.heading, note, id = "pipeline-h" }: Props) {
  const ui = homeBandsUi.pipeline;
  const wrap = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // only honour the preference after mount so the first client render matches the server
  const reduce = mounted && prefersReduced;
  const [desktop, setDesktop] = useState(false);
  const [scrollActive, setScrollActive] = useState(-1);
  const [cycle, setCycle] = useState(-1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const pin = desktop && !reduce;
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pin) return;
    setScrollActive(Math.min(STAGES.length - 1, Math.max(0, Math.floor(v * STAGES.length * 1.02))));
  });

  // when not scroll-pinned, walk the highlight through the stages
  useEffect(() => {
    if (pin || reduce) return;
    const t = window.setInterval(() => setCycle((c) => (c + 1) % STAGES.length), 2600);
    return () => window.clearInterval(t);
  }, [pin, reduce]);

  const active = reduce ? 2 : pin ? Math.max(0, scrollActive) : cycle;

  return (
    <Section scene="Pipeline" labelledBy={id}>
      <div ref={wrap} className={pin ? "relative h-[210vh]" : "relative"}>
        <div className={pin ? "sticky top-0 flex h-screen flex-col justify-center pb-6 pt-20" : "section-y"}>
          <div className="container-x">
            <div className="grid grid-cols-12 items-end gap-y-5 lg:gap-x-10">
              <div className="col-span-12 lg:col-span-7">
                <p className={id === "pipeline-h" ? "section-index" : "hidden"}>
                  {ui.index} — {ui.label}
                </p>
                <h2 id={id} className="h2 text-gradient mt-5 max-w-[20ch] pb-1">
                  {heading}
                </h2>
              </div>
              <div className="col-span-12 lg:col-span-5 lg:pb-3">
                <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted md:text-[16px]">{note ?? misc.pipelineReviewNote}</p>
              </div>
            </div>

            <div className="panel mt-8 overflow-hidden lg:mt-10">
              <div className="panel-header">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="panel-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="truncate text-text/80">{ui.panelTitle}</span>
                </span>
                <Legend className="hidden md:inline-flex" />
                <span className="flex shrink-0 items-center gap-3">
                  <span className="live-dot" aria-hidden="true" />
                  <SimLabel className="!hidden !text-[10px] sm:!flex" />
                  <SimLabel className="!text-[10px] sm:!hidden" text={pagesUi.sim} />
                </span>
              </div>
              <div
                className="relative px-2 sm:px-3"
                style={{
                  backgroundImage: "radial-gradient(rgba(233,238,243,0.05) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              >
                <div className="hidden lg:block">
                  <PipelineDiagram orientation="h" stages={STAGES} gates={GATES} active={active} reduced={reduce} />
                </div>
                <div className="lg:hidden">
                  <PipelineDiagram orientation="v" stages={STAGES} gates={GATES} active={active} reduced={reduce} />
                </div>
              </div>
              <div className="flex border-t border-white/[0.06] px-4 py-3 md:hidden">
                <Legend className="flex flex-wrap gap-y-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
