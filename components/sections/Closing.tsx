import { closingUi, home } from "@/content/copy";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Section from "./Section";

export default function Closing({ withBody = true }: { withBody?: boolean }) {
  const c = home.closing;
  return (
    <Section scene="SignalFieldCalm" labelledBy="closing-h" scrim={false} className="overflow-hidden py-32 lg:py-48">
      {/* Radial scrim keeps the centred copy legible while the calm envelope glows around it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 62% 58% at 50% 55%, rgba(6,8,11,0.94) 0%, rgba(6,8,11,0.7) 50%, rgba(6,8,11,0) 100%)" }}
      />
      {/* Brand mark as a slow, low-opacity halo behind the heading */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <img
          src="/brand/logo-mark.png"
          alt=""
          width={180}
          height={180}
          className="closing-mark h-[min(78vw,640px)] w-[min(78vw,640px)] opacity-[0.07]"
        />
        <div className="absolute h-[min(60vw,460px)] w-[min(60vw,460px)] rounded-full border border-accent/15" />
        <div className="absolute h-[min(70vw,560px)] w-[min(70vw,560px)] rounded-full border border-dashed border-line" />
      </div>

      <div className="container-x flex flex-col items-center text-center">
        <Reveal>
          <p className="section-index mb-8 justify-center">{closingUi.index}</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 id="closing-h" className="font-display text-gradient max-w-[16ch] text-[clamp(40px,6vw,88px)] leading-[1.02] tracking-[-0.035em]">
            {c.heading}
          </h2>
        </Reveal>
        {withBody ? (
          <Reveal delay={0.08}>
            <p className="mx-auto mt-7 max-w-[56ch] text-[17px] leading-relaxed text-muted md:text-[19px]">{c.body}</p>
          </Reveal>
        ) : null}
        <Reveal delay={0.12}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Button href={c.cta.href} className="glow-accent">
              {c.cta.label}
            </Button>
            <Button href={closingUi.secondary.href} variant="secondary">
              {closingUi.secondary.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
