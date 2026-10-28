import { home, misc, v2Ui } from "@/content/copy";
import SectionHeading from "@/components/v2/ui/SectionHeading";
import { LoopIcon } from "./icons";

// Stages held at a human review gate before work moves on.
const GATES: ReadonlySet<string> = new Set(["Backtesting", "Risk controls"]);

function ReviewBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-semibold text-accent">
      {home.pipeline.gateLabel}
    </span>
  );
}

export default function Pipeline() {
  const p = home.pipeline;
  const last = p.stages.length - 1;
  return (
    <section aria-labelledby="pipeline-title" className="section-y bg-surface">
      <div className="container-x">
        <SectionHeading id="pipeline-title" eyebrow={v2Ui.eyebrows.pipeline} title={p.heading} />

        <div className="mt-14 rounded-2xl border border-line bg-white p-6 sm:p-10">
          <ol className="flex flex-col lg:grid lg:grid-cols-6">
            {p.stages.map((stage, i) => {
              const gate = GATES.has(stage);
              return (
                <li key={stage} className="relative flex gap-5 pb-8 last:pb-0 lg:flex-col lg:gap-5 lg:pb-0">
                  {/* Connector to the next stage: vertical on mobile, horizontal on desktop. */}
                  {i < last ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-5 top-11 w-px bg-line lg:bottom-auto lg:left-14 lg:right-3 lg:top-5 lg:h-px lg:w-auto"
                    />
                  ) : null}
                  <span
                    className={`num relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[14px] font-semibold ${
                      gate ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-text"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-2 lg:pr-4 lg:pt-0">
                    <p className="text-[16px] font-semibold text-text">{stage}</p>
                    {gate ? (
                      <div className="mt-2">
                        <ReviewBadge />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-[15px] text-body md:flex-row md:items-center md:gap-10">
            <p className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text">
                <LoopIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="font-semibold capitalize text-text">{p.loop}</span>
                <span aria-hidden="true" className="mx-2 text-muted">
                  ·
                </span>
                {v2Ui.pipelineLoopNote}
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
  );
}
