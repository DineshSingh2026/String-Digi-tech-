"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { home, homeBandsUi } from "@/content/copy";
import SimLabel from "@/components/ui/SimLabel";
import RegimeChart, { REGIME_HEX, type RegimeReadout } from "@/scenes/RegimeMap/RegimeChart";
import Section from "./Section";

export default function RiskFirst() {
  const r = home.riskFirst;
  const ui = homeBandsUi.risk;
  const wrap = useRef<HTMLDivElement>(null);
  const chartBox = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [desktop, setDesktop] = useState(false);
  const [active, setActive] = useState(0);
  const [stepFill, setStepFill] = useState(0);
  const [read, setRead] = useState<RegimeReadout>({ regime: 0, exposure: 0.8, drawdown: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Desktop: pinned band drives the playhead. Mobile: the chart's own pass through the viewport does.
  const pinned = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const inline = useScroll({ target: chartBox, offset: ["start 0.85", "end 0.25"] });
  const scrollYProgress = desktop ? pinned.scrollYProgress : inline.scrollYProgress;
  const onProgress = (v: number) => {
    const k = Math.min(r.steps.length - 1, Math.max(0, Math.floor(v * r.steps.length)));
    setActive(k);
    setStepFill(Math.min(1, Math.max(0, v * r.steps.length - k)));
  };
  useMotionValueEvent(pinned.scrollYProgress, "change", (v) => {
    if (desktop) onProgress(v);
  });
  useMotionValueEvent(inline.scrollYProgress, "change", (v) => {
    if (!desktop) onProgress(v);
  });

  const regimeColor = REGIME_HEX[read.regime] ?? REGIME_HEX[0];
  const ddRatio = Math.min(1, read.drawdown / 0.1);

  return (
    <Section scene="RegimeMap" labelledBy="risk-h">
      <div ref={wrap} className="relative lg:h-[360vh]">
        <div className="section-y lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:!pb-6 lg:!pt-20">
          <div className="container-x grid grid-cols-12 gap-y-12 lg:gap-x-12">
            {/* Copy column */}
            <div className="col-span-12 flex flex-col lg:col-span-5">
              <p className="section-index">
                {ui.index} — {ui.label}
              </p>
              <h2 id="risk-h" className="text-gradient mt-5 pb-1 font-display text-[clamp(32px,3.2vw,48px)] leading-[1.04]">
                {r.heading}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted xl:text-[16px]">{r.body}</p>
              <ol className="mt-6 flex flex-col">
                {r.steps.map((s, i) => {
                  const on = i === active;
                  const done = i < active;
                  return (
                    <li
                      key={s}
                      aria-current={on && desktop ? "step" : undefined}
                      className={`relative grid grid-cols-[36px_1fr] items-center gap-3 border-t py-3 transition-colors duration-500 ${
                        on ? "border-accent/50" : "border-line"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[-1px] h-px bg-accent transition-[width] duration-150"
                        style={{ width: on ? `${Math.round(stepFill * 100)}%` : done ? "100%" : "0%" }}
                      />
                      <span className={`mono text-[12px] ${on ? "text-accent" : done ? "text-text" : "text-muted"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-[18px] leading-snug transition-colors duration-500 xl:text-[20px] ${
                          on || !desktop ? "text-text" : done ? "text-text/70" : "text-muted"
                        }`}
                      >
                        {s}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-6 border-l-2 border-accent bg-accent/[0.06] py-3 pl-4 pr-3 font-display text-[17px] leading-snug text-text xl:text-[19px]">
                {r.closing}
              </p>
            </div>

            {/* Chart column */}
            <div className="col-span-12 lg:col-span-7">
              <div className="panel overflow-hidden">
                <div className="panel-header">
                  <span className="flex items-center gap-3">
                    <span className="panel-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="text-text/80">{ui.panelTitle}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="live-dot" aria-hidden="true" />
                    <SimLabel className="!text-[10px]" />
                  </span>
                </div>
                <div ref={chartBox} className="relative h-[340px] bg-bg/50 sm:h-[400px] lg:h-[min(440px,calc(100vh-330px))]">
                  <RegimeChart progress={scrollYProgress} step={desktop ? active : -1} reduced={reduce} onReadout={setRead} />
                </div>
                {/* live readout */}
                <dl className="grid grid-cols-3 border-t border-line/80">
                  <div className="flex flex-col gap-2 px-4 py-3 sm:px-5">
                    <dt className="eyebrow !text-[10px]">{ui.regime}</dt>
                    <dd className="mono flex items-center gap-2 text-[13px] text-text">
                      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: regimeColor, boxShadow: `0 0 10px ${regimeColor}` }} />
                      <span className="truncate">{r.regimes[read.regime]}</span>
                    </dd>
                  </div>
                  <div className="flex flex-col gap-2 border-l border-line/80 px-4 py-3 sm:px-5">
                    <dt className="eyebrow !text-[10px]">{ui.exposure}</dt>
                    <dd className="flex items-center gap-3">
                      <span className="mono w-10 text-[13px] text-text">
                        {Math.round(read.exposure * 100)}
                        {ui.unit}
                      </span>
                      <span aria-hidden="true" className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-text/80" style={{ width: `${(read.exposure * 100).toFixed(2)}%` }} />
                      </span>
                    </dd>
                  </div>
                  <div className="flex flex-col gap-2 border-l border-line/80 px-4 py-3 sm:px-5">
                    <dt className="eyebrow !text-[10px]">
                      {ui.drawdown} / {ui.limit}
                    </dt>
                    <dd className="flex items-center gap-3">
                      <span className="mono whitespace-nowrap text-[13px] text-risk">
                        -{(read.drawdown * 100).toFixed(1)}
                        <span className="text-muted">
                          {" "}
                          / -10{ui.unit}
                        </span>
                      </span>
                      <span aria-hidden="true" className="relative hidden h-1 flex-1 rounded-full bg-line sm:block">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-risk" style={{ width: `${(ddRatio * 100).toFixed(2)}%` }} />
                        <span className="absolute -top-1 right-0 h-3 w-px bg-caution" />
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
                {r.regimes.map((g, i) => (
                  <span key={g} className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-muted">
                    <span aria-hidden="true" className="h-[3px] w-4 rounded-full" style={{ background: REGIME_HEX[i] }} />
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
