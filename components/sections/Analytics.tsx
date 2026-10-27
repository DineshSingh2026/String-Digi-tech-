"use client";

import { useRef } from "react";
import { home, solutions, bandsUi } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import SimLabel from "@/components/ui/SimLabel";
import { useRectProgress } from "@/scenes/engine/useRectProgress";
import { CONFIG, phases } from "@/scenes/NoiseToSignal/config";
import Section from "./Section";

const ui = bandsUi.analytics;

/* 16px line glyphs, one per input / output (decorative). */
const INPUT_GLYPHS = [
  "M1 12 L4 8 L7 10 L10 4 L13 7 L15 3",
  "M2 3h5v5H2zM9 3h5v5H9zM2 10h5v4H2zM9 10h5v4H9z",
  "M3 4h.01M8 3h.01M13 5h.01M5 9h.01M11 9h.01M3 13h.01M9 13h.01M14 12h.01",
];
const OUTPUT_GLYPHS = [
  "M4 5a1.5 1.5 0 1 0 0.01 0M11 4a1.5 1.5 0 1 0 0.01 0M7 11a1.5 1.5 0 1 0 0.01 0",
  "M1 12 C5 11 8 7 15 4 M1 9 C5 8 8 4 15 1",
  "M2 2h12v12H2zM2 6h12M7 6v8",
  "M3 2h10v12H3zM5 5h6M5 8h6M5 11h4",
];

function Glyph({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/** Curved connectors from n evenly-spaced rows into (or out of) the vertical centre of the stage. */
function Connectors({ n, dir, active }: { n: number; dir: "in" | "out"; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
      {Array.from({ length: n }, (_, i) => {
        const y = ((i + 0.5) / n) * 100;
        const d = dir === "in" ? `M0,${y} C55,${y} 45,50 100,50` : `M0,50 C55,50 45,${y} 100,${y}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path
              d={d}
              fill="none"
              stroke={dir === "in" ? "var(--muted)" : "var(--signal)"}
              strokeOpacity={active ? 0.9 : 0.25}
              strokeWidth="1.5"
              strokeDasharray="3 9"
              vectorEffect="non-scaling-stroke"
              className="flow-dash"
              style={{ transition: "stroke-opacity 600ms var(--ease-ui)" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function Analytics() {
  const a = home.analytics;
  const stageRef = useRef<HTMLDivElement>(null);
  const lp = useRectProgress(stageRef);
  const ph = phases(lp);
  const step = ph.draw > 0.02 ? 2 : ph.organise > 0.25 ? 1 : 0;
  const clustered = Math.round(CONFIG.count * 0.85);
  const classified = Math.round(ph.organise * clustered);
  const clusters = ph.organise > 0.55 ? Math.min(CONFIG.clusters, 1 + Math.floor((ph.organise - 0.55) / 0.09)) : 0;
  const noisePct = (ph.organise * 15).toFixed(1);
  const band = ph.draw > 0 ? `±${(0.42 - 0.24 * ph.draw).toFixed(2)}` : "—";

  return (
    <Section scene="NoiseToSignal" labelledBy="analytics-h" className="overflow-hidden py-24 lg:py-32" scrim={false}>
      <style>{`
        @keyframes flow-dash { to { stroke-dashoffset: -24; } }
        .flow-dash { animation: flow-dash 1.4s linear infinite; }
      `}</style>
      <div className="container-x">
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <p className="section-index mb-6">
                06 / {bandsUi.index.total} — {bandsUi.index.analytics}
              </p>
              <h2 id="analytics-h" className="h2 text-gradient max-w-[14ch]">
                {a.heading}
              </h2>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <Reveal delay={0.08}>
              <p className="text-[17px] leading-relaxed text-muted md:text-[18px]">{solutions["data-analytics"].sub}</p>
            </Reveal>
          </div>
        </div>

        {/* flow: inputs → stage → outputs */}
        <div className="mt-14 grid grid-cols-1 gap-y-6 lg:mt-20 lg:grid-cols-[220px_56px_minmax(0,1fr)_56px_236px] lg:gap-y-3">
          <p className="eyebrow lg:col-start-1 lg:row-start-1">{a.inputsLabel}</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:col-start-1 lg:row-start-2 lg:flex lg:flex-col lg:justify-around lg:gap-0">
            {a.inputs.map((x, i) => (
              <li key={x} className="panel flex items-center gap-3 px-4 py-3.5">
                <Glyph d={INPUT_GLYPHS[i]} className="shrink-0 text-muted" />
                <span className="whitespace-nowrap text-[15px] text-text">{x}</span>
                <span className="mono ml-auto text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ul>

          <div className="relative hidden lg:col-start-2 lg:row-start-2 lg:block">
            <Connectors n={a.inputs.length} dir="in" active={step >= 0} />
          </div>

          <div className="flex items-center justify-between gap-3 lg:col-start-3 lg:row-start-1">
            <span className="eyebrow flex items-center gap-2">
              <span className="live-dot" aria-hidden="true" /> {ui.stageTitle}
            </span>
            <ol className="hidden items-center gap-1.5 sm:flex" aria-label={ui.stage}>
              {ui.steps.map((s, i) => (
                <li
                  key={s}
                  aria-current={i === step ? "step" : undefined}
                  className={`mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors duration-500 ${
                    i === step
                      ? "border-signal/60 bg-signal/10 text-signal"
                      : i < step
                        ? "border-line text-text"
                        : "border-line text-muted"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")} {s}
                </li>
              ))}
            </ol>
          </div>

          <div ref={stageRef} className="relative h-[360px] sm:h-[440px] lg:col-start-3 lg:row-start-2 lg:h-[540px]">
            {/* the WebGL scene is drawn into this box */}
            <div data-scene-rect className="absolute inset-0" />
            <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 rounded-2xl border border-line/80" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_80px_rgba(6,8,11,0.9)]" />
            {(["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-l border-b", "right-3 bottom-3 border-r border-b"] as const).map((c) => (
              <span key={c} aria-hidden="true" className={`pointer-events-none absolute h-4 w-4 border-accent/70 ${c}`} />
            ))}
          </div>

          <div className="relative hidden lg:col-start-4 lg:row-start-2 lg:block">
            <Connectors n={a.outputs.length} dir="out" active={step >= 2} />
          </div>

          <p className="eyebrow lg:col-start-5 lg:row-start-1">{a.outputsLabel}</p>
          <ul className="grid grid-cols-2 gap-2 lg:col-start-5 lg:row-start-2 lg:flex lg:flex-col lg:justify-around lg:gap-0">
            {a.outputs.map((x, i) => {
              const on = step >= 2;
              return (
                <li
                  key={x}
                  className={`panel flex items-center gap-3 px-4 py-4 transition-[border-color,box-shadow] duration-700 ${
                    on ? "border-signal/40 shadow-[0_0_0_1px_rgba(51,209,180,0.15),0_12px_40px_-16px_rgba(51,209,180,0.5)]" : ""
                  }`}
                >
                  <Glyph d={OUTPUT_GLYPHS[i]} className={`shrink-0 transition-colors duration-700 ${on ? "text-signal" : "text-muted"}`} />
                  <span className="font-display text-[16px] leading-tight text-text">{x}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* live readout bar, in step with the scene */}
        <div className="panel mt-6 lg:ml-[276px] lg:mr-[292px]">
          <div className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
            {[
              { k: ui.pointsClassified, v: classified.toLocaleString("en-US"), tone: "text-text" },
              { k: ui.clusters, v: `${clusters} / ${CONFIG.clusters}`, tone: clusters ? "text-signal" : "text-muted" },
              { k: ui.noiseFiltered, v: `${noisePct}%`, tone: "text-text" },
              { k: ui.confidenceBand, v: band, tone: ph.draw > 0 ? "text-signal" : "text-muted" },
            ].map((s) => (
              <div key={s.k} className="flex flex-col gap-1 px-4 py-3">
                <span className="eyebrow text-[10px]">{s.k}</span>
                <span className={`mono text-[18px] tabular-nums ${s.tone}`}>{s.v}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 px-4 py-2">
            <SimLabel className="text-[10px]" />
          </div>
        </div>
      </div>
    </Section>
  );
}
