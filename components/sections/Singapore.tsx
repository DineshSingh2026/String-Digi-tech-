import { home, bandsUi } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import SessionClock from "@/components/interactive/SessionClock";
import Section from "./Section";

export default function Singapore() {
  return (
    <Section labelledBy="sg-h" className="overflow-hidden py-24 lg:py-32" scrim={false}>
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/2 -z-10 h-[760px] w-[760px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(244,78,4,0.08),transparent)]"
      />
      <div className="container-x">
        <SessionClock
          lead={
            <Reveal>
              <p className="section-index mb-6">
                11 / {bandsUi.index.total} — {bandsUi.index.singapore}
              </p>
              <h2 id="sg-h" className="h2 text-gradient">
                {home.singapore.heading}
              </h2>
            </Reveal>
          }
        />
      </div>
    </Section>
  );
}
