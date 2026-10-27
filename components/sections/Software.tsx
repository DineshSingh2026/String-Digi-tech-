"use client";

import { home, solutions, bandsUi } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import Workstation from "@/components/software/Workstation";
import Section from "./Section";

export default function Software() {
  const s = home.software;
  const offerings = solutions.software.groups[0].items;

  return (
    <Section scene="None" labelledBy="software-h" className="overflow-hidden py-24 lg:py-32" scrim={false}>
      {/* faint ambient glow behind the workstation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_55%_at_30%_50%,rgba(244,78,4,0.07),transparent_70%),radial-gradient(ellipse_40%_40%_at_25%_60%,rgba(51,209,180,0.05),transparent_70%)]"
      />
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="container-x grid grid-cols-12 items-center gap-x-6 gap-y-12 lg:gap-x-10">
        <div className="col-span-12 lg:order-2 lg:col-span-5">
          <Reveal>
            <p className="section-index mb-6">
              08 / {bandsUi.index.total} — {bandsUi.index.software}
            </p>
            <h2 id="software-h" className="h2 text-gradient">
              {s.heading}
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-muted md:text-[18px]">{s.body}</p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <p className="eyebrow mb-4">{solutions.software.groups[0].heading}</p>
            <ul className="flex flex-col">
              {offerings.map((o, i) => (
                <li
                  key={o}
                  className="group flex items-center gap-4 border-t border-[rgba(233,238,243,0.07)] py-3 text-[15px] text-text/90 transition-colors duration-300 last:border-b hover:text-text"
                >
                  <span className="mono w-6 shrink-0 text-[11px] text-muted transition-colors duration-300 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="col-span-12 min-w-0 lg:order-1 lg:col-span-7">
          <Workstation />
        </div>
      </div>
    </Section>
  );
}
