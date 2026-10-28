import type { Metadata } from "next";
import { notFound, pagesUi } from "@/content/copy";
import Button from "@/components/ui/Button";
import Panel from "@/components/pages/Panel";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = { title: notFound.h1, robots: { index: false } };

// Decorative trace that drops out mid-way: a flatline gap where the signal is lost.
const TRACE_A = "M0 60 L30 58 L48 40 L62 76 L80 52 L96 64 L120 46 L138 70 L160 55 L176 62 L196 50 L212 60";
const TRACE_B = "M300 60 L322 52 L340 72 L356 44 L374 66 L392 54 L410 62 L432 40 L450 74 L470 58 L500 60";

export default function NotFound() {
  return (
    <section data-scene="SignalFieldCalm" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <div aria-hidden="true" className="scrim pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="container-x grid grid-cols-12 items-center gap-x-6 gap-y-12 pb-20 pt-32">
        <div className="col-span-12 lg:col-span-7">
          <p
            aria-hidden="true"
            className="text-gradient-accent mono select-none text-[clamp(120px,20vw,260px)] font-medium leading-[0.85] tracking-[-0.06em]"
          >
            {notFound.eyebrow}
          </p>
          <h1 className="text-gradient mt-8 max-w-[14ch] pb-2 font-display text-[clamp(40px,5vw,72px)] leading-[1.03] tracking-[-0.04em]">
            {notFound.h1}
          </h1>
          <p className="mt-5 text-[18px] text-muted">{notFound.body}</p>
          <div className="mt-10">
            <Button href={notFound.cta.href}>{notFound.cta.label}</Button>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <Panel
            title={pagesUi.notFound.status}
            right={
              <span className="flex items-center gap-2 text-risk">
                <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-risk" />
                {pagesUi.notFound.lost}
              </span>
            }
            bodyClassName="p-5"
          >
            <svg viewBox="0 0 500 120" className="block h-auto w-full" aria-hidden="true">
              <defs>
                <pattern id="nf-grid" width="25" height="20" patternUnits="userSpaceOnUse">
                  <path d="M25 0H0V20" fill="none" stroke="rgba(233,238,243,0.05)" />
                </pattern>
              </defs>
              <rect width="500" height="120" fill="url(#nf-grid)" />
              <path d={TRACE_A} fill="none" stroke="var(--signal)" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M212 60 L300 60" fill="none" stroke="var(--risk)" strokeWidth="1.4" strokeDasharray="3 5" />
              <rect x="212" y="10" width="88" height="100" fill="var(--risk)" fillOpacity="0.07" />
              <path d={TRACE_B} fill="none" stroke="var(--signal)" strokeOpacity="0.35" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="212" cy="60" r="4" fill="var(--risk)" />
            </svg>
            <div className="mt-4 flex items-center gap-3">
              <span aria-hidden="true" className="shrink-0">
                <Logo variant="mark" height={28} />
              </span>
            <p className="mono text-[12px] uppercase tracking-[0.12em] text-muted">
              {notFound.eyebrow} · <span className="text-text">{notFound.body}</span>
            </p>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
