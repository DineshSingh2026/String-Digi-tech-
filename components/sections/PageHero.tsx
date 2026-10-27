import type { Link as Crumb } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import Trail from "@/components/pages/Trail";
import Section from "./Section";

type Props = {
  scene?: string;
  eyebrow?: string;
  title: string;
  sub?: string;
  /** Visible breadcrumb trail after home; the last item is the current page. */
  crumbs?: Crumb[];
  /** Short index marker, e.g. "01 / 04". */
  index?: string;
  /** Floating panel rendered on the right on large screens. */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  /** Reserve a full-width strip under the content for the scene (via data-scene-rect) so it stays clear of text and panels. */
  sceneBand?: boolean;
};

export default function PageHero({ scene, eyebrow, title, sub, crumbs = [], index, aside, children, sceneBand = false }: Props) {
  return (
    <Section scene={scene} labelledBy="page-h" className="overflow-hidden">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12%] top-[8%] -z-10 h-[520px] w-[520px] rounded-full bg-accent/[0.07] blur-[120px]"
      />
      <div
        className={`container-x grid grid-cols-12 items-center gap-x-6 gap-y-12 pt-32 lg:pt-36 ${
          sceneBand ? "pb-4" : "min-h-[min(92svh,960px)] pb-16 md:pb-20"
        }`}
      >
        <div className={`col-span-12 ${aside ? "lg:col-span-7" : "lg:col-span-10"}`}>
          <Reveal>
            <Trail crumbs={crumbs} className="mb-10" />
          </Reveal>
          {eyebrow || index ? (
            <Reveal delay={0.03}>
              <p className="section-index mb-7">
                {index ? <span className="text-accent">{index}</span> : null}
                {index && eyebrow ? <span aria-hidden="true">—</span> : null}
                {eyebrow ? <span>{eyebrow}</span> : null}
              </p>
            </Reveal>
          ) : null}
          <Reveal delay={0.06}>
            <h1
              id="page-h"
              className="text-gradient max-w-[18ch] pb-2 font-display text-[clamp(38px,5vw,76px)] leading-[1.03] tracking-[-0.04em]"
            >
              {title}
            </h1>
          </Reveal>
          {sub ? (
            <Reveal delay={0.1}>
              <p className="prose-body mt-7 border-l border-accent/60 pl-5 text-[17px] leading-relaxed text-muted md:text-[19px]">
                {sub}
              </p>
            </Reveal>
          ) : null}
          {children}
        </div>
        {aside ? (
          <div className="col-span-12 lg:col-span-5">
            <Reveal delay={0.14}>{aside}</Reveal>
          </div>
        ) : null}
      </div>
      {sceneBand ? (
        <div aria-hidden="true" className="relative h-[180px] md:h-[240px]">
          <div data-scene-rect className="absolute inset-0" />
        </div>
      ) : null}
      <div className="container-x">
        <div className="hairline" />
      </div>
    </Section>
  );
}
