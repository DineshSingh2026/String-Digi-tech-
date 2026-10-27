import { home, bandsUi } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import Section from "./Section";

/* 24px stroke icons, one per point (decorative). */
const ICONS: React.ReactNode[] = [
  // Singapore-based: location pin over a grid horizon
  <>
    <path d="M12 21s-6-5.6-6-10.2A6 6 0 0 1 18 10.8C18 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.2" />
    <path d="M3 21h18" opacity="0.5" />
  </>,
  // AI integrated: small network
  <>
    <circle cx="5" cy="6" r="2" />
    <circle cx="5" cy="18" r="2" />
    <circle cx="12" cy="12" r="2.2" />
    <circle cx="19" cy="7" r="2" />
    <circle cx="19" cy="17" r="2" />
    <path d="M6.7 7.1 10.2 10.8M6.7 16.9l3.5-3.7M13.9 11.1l3.3-2.7M13.9 12.9l3.3 2.7" />
  </>,
  // Risk management: shield holding a line between limits
  <>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.1 7.5 9.5 4.3-1.4 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="M8 11.5c1.3-1.6 2.6 1.6 4 0s2.7-1.6 4 0" />
  </>,
  // End-to-end: research → infrastructure → software
  <>
    <circle cx="4" cy="12" r="2" />
    <rect x="10" y="10" width="4" height="4" rx="0.8" />
    <circle cx="20" cy="12" r="2" />
    <path d="M6 12h4M14 12h4" />
  </>,
  // Practical, results-oriented: target
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </>,
];

export default function Why() {
  const w = home.why;
  return (
    <Section labelledBy="why-h" className="overflow-hidden py-24 lg:py-32" scrim={false}>
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-80" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/3 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(244,78,4,0.10),transparent)]"
      />
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="section-index mb-6">
                10 / {bandsUi.index.total} — {bandsUi.index.why}
              </p>
              <h2 id="why-h" className="h2 text-gradient max-w-[10ch]">
                {w.heading}
              </h2>
            </Reveal>
          </div>
        </div>
        <ol className="col-span-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8">
          {w.items.map((t, i) => {
            const wide = i === 0;
            return (
              <li key={t} className={wide ? "sm:col-span-2" : ""}>
                <Reveal delay={i * 0.06} className="h-full">
                  <Spotlight className={`panel h-full p-6 md:p-7 ${wide ? "md:p-9" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/30 bg-accent/[0.06] text-accent shadow-[0_0_24px_-6px_rgba(244,78,4,0.45)]">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          {ICONS[i]}
                        </svg>
                      </span>
                      <span className="mono text-[12px] tabular-nums text-muted">
                        {String(i + 1).padStart(2, "0")} / {String(w.items.length).padStart(2, "0")}
                      </span>
                    </div>
                    <p
                      className={`mt-8 text-text ${
                        wide ? "font-display max-w-[30ch] text-[clamp(22px,2.4vw,32px)] leading-[1.15]" : "text-[17px] leading-relaxed md:text-[18px]"
                      }`}
                    >
                      {t}
                    </p>
                  </Spotlight>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
