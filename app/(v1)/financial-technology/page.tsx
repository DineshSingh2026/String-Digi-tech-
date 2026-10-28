import type { Metadata } from "next";
import Link from "next/link";
import { company, fintech, footer, home, nav } from "@/content/copy";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/sections/Section";
import Closing from "@/components/sections/Closing";
import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Panel from "@/components/pages/Panel";
import Icon, { type IconKind } from "@/components/pages/Icons";

export const metadata: Metadata = {
  title: fintech.title,
  description: fintech.sub,
  alternates: { canonical: "/financial-technology" },
};

const pad = (n: number) => String(n).padStart(2, "0");
const SUPPORT_ICONS: IconKind[] = ["stack", "chart", "algo", "shield"];
const TILE_ICONS: IconKind[] = ["algo", "chart", "nodes", "code"];

function CapabilitiesPanel() {
  return (
    <Panel
      title={nav.solutionsLabel}
      right={<span className="mono text-[11px] text-muted">{pad(home.services.tiles.length)}</span>}
      bodyClassName="p-2"
      footer={
        <p className="mono flex justify-between gap-4 text-[10.5px] uppercase tracking-[0.12em] text-muted">
          <span className="truncate">{company.legalName}</span>
          <span className="shrink-0">
            {footer.uenLabel} <span className="text-text/80">{company.uen}</span>
          </span>
        </p>
      }
    >
      <ul>
        {home.services.tiles.map((t, i) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="group flex items-center gap-4 rounded-lg p-3.5 transition-colors hover:bg-white/[0.04]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-text/80 transition-colors group-hover:border-accent/50 group-hover:text-text">
                <Icon kind={TILE_ICONS[i] ?? "stack"} className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="mono block text-[10.5px] tracking-[0.12em] text-accent">{pad(i + 1)}</span>
                <span className="block text-[15px] leading-snug text-text">{t.title}</span>
              </span>
              <span aria-hidden="true" className="text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function FintechPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: fintech.title, path: "/financial-technology" }]} />
      <PageHero
        scene="SignalFieldCalm"
        title={fintech.h1}
        sub={fintech.sub}
        crumbs={[{ label: fintech.title, href: "/financial-technology" }]}
        aside={<CapabilitiesPanel />}
      />
      <Section className="py-20 lg:py-28" labelledBy="supports-h">
        <div className="container-x">
          <Reveal>
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-index mb-6">
                  <span className="text-accent">01</span>
                  <span aria-hidden="true">—</span>
                  <span>{fintech.title}</span>
                </p>
                <h2 id="supports-h" className="h2">
                  {fintech.supportsHeading}
                </h2>
              </div>
              <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">[{pad(fintech.supports.length)}]</p>
            </div>
          </Reveal>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fintech.supports.map((t, i) => (
              <li key={t}>
                <Reveal delay={i * 0.06} className="h-full">
                  <Spotlight className="panel group relative flex h-full min-h-[260px] flex-col justify-between gap-10 overflow-hidden p-7 md:p-9">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/[0.06] blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="flex items-start justify-between">
                      <span className="grid h-14 w-14 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-text/85">
                        <Icon kind={SUPPORT_ICONS[i] ?? "stack"} className="h-8 w-8" />
                      </span>
                      <span aria-hidden="true" className="mono text-[44px] leading-none tracking-[-0.04em] text-white/[0.09]">{pad(i + 1)}</span>
                    </div>
                    <p className="max-w-[22ch] font-display text-[clamp(24px,2.4vw,32px)] leading-[1.12] tracking-[-0.03em]">{t}</p>
                  </Spotlight>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>
      <Closing />
    </>
  );
}
