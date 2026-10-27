import { home, bandsUi } from "@/content/copy";
import PrincipleRow from "@/components/ui/PrincipleRow";
import Reveal from "@/components/ui/Reveal";
import Section from "./Section";

type Props = { heading?: string; scene?: string; id?: string };

const ui = bandsUi.principles;

export default function Principles({ heading = home.principles.heading, scene = "Bounded", id = "principles-h" }: Props) {
  const onHome = heading === home.principles.heading;
  return (
    <Section scene={scene} labelledBy={id} className="overflow-hidden py-24 lg:py-32" scrim={false}>
      <div className="container-x">
        <div className="grid grid-cols-12 items-center gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              {onHome ? (
                <p className="section-index mb-6">
                  09 / {bandsUi.index.total} — {bandsUi.index.principles}
                </p>
              ) : null}
              <h2 id={id} className="h2 text-gradient max-w-[16ch]">
                {heading}
              </h2>
            </Reveal>
          </div>
          {/* the Bounded scene is drawn into this box: a live line held between two limits */}
          <div className="relative col-span-12 h-[200px] sm:h-[240px] lg:col-span-7 lg:h-[280px]">
            <div data-scene-rect className="absolute inset-0" />
            <span className="mono pointer-events-none absolute right-0 top-[11%] -translate-y-[calc(100%+6px)] text-[10px] uppercase tracking-[0.12em] text-caution/90">
              {ui.upper}
            </span>
            <span className="mono pointer-events-none absolute right-0 top-[89%] translate-y-[6px] text-[10px] uppercase tracking-[0.12em] text-caution/90">
              {ui.lower}
            </span>
            <span className="mono pointer-events-none absolute left-0 top-[11%] -translate-y-[calc(100%+6px)] flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-signal">
              <span className="live-dot" aria-hidden="true" />
              {ui.within}
            </span>
          </div>
        </div>
        <div className="mt-14 border-b border-line lg:mt-20">
          {home.principles.items.map((t, i) => (
            <Reveal key={t} delay={i * 0.06}>
              <PrincipleRow index={i} text={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
