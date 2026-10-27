import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { home, nav, pagesUi, solutions, type SolutionSlug } from "@/content/copy";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/sections/Section";
import Closing from "@/components/sections/Closing";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import DisclaimerBlock from "@/components/ui/DisclaimerBlock";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RiskLimitSlider from "@/components/interactive/RiskLimitSlider";
import AnalyticsDashboard from "@/components/interactive/AnalyticsDashboard";
import MonitoringPanel from "@/components/interactive/MonitoringPanel";
import { SpecGroups, SpecSheet } from "@/components/pages/SolutionParts";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(solutions) as SolutionSlug[]).map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

function get(slug: string) {
  return slug in solutions ? solutions[slug as SolutionSlug] : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = get(slug);
  if (!s) return {};
  return { title: s.title, description: s.sub, alternates: { canonical: `/solutions/${slug}` } };
}

const pad = (n: number) => String(n).padStart(2, "0");

function WidgetSection({ index, heading, hint, children }: { index: string; heading: string; hint?: string; children: React.ReactNode }) {
  return (
    <Section className="py-20 lg:py-28" labelledBy="widget-h">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="container-x">
        <Reveal>
          <p className="section-index mb-6">
            <span className="text-accent">{index}</span>
            <span aria-hidden="true">—</span>
            <span>{pagesUi.simulation}</span>
          </p>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="widget-h" className="h2">
              {heading}
            </h2>
            {hint ? <p className="mono text-[12px] uppercase tracking-[0.12em] text-muted">{hint}</p> : null}
          </div>
        </Reveal>
        <Reveal delay={0.06}>{children}</Reveal>
      </div>
    </Section>
  );
}

export default async function SolutionPage({ params }: Params) {
  const { slug } = await params;
  const s = get(slug);
  if (!s) notFound();
  const href = `/solutions/${slug}`;
  const pos = nav.solutions.findIndex((l) => l.href === href);
  const widgetIndex = pad(s.groups.length + 1);

  return (
    <>
      <Breadcrumbs items={[{ name: s.title, path: href }]} />
      <PageHero
        scene={s.scene}
        index={`${pad(pos + 1)} / ${pad(nav.solutions.length)}`}
        eyebrow={nav.solutionsLabel}
        title={s.h1}
        sub={s.sub}
        crumbs={[
          { label: nav.solutionsLabel, href: nav.solutions[0].href },
          { label: s.title, href },
        ]}
        aside={<SpecSheet title={s.title} groups={s.groups} current={href} />}
      />

      <Section className="pb-12 pt-20 lg:pb-16 lg:pt-28">
        <div className="container-x">
          <SpecGroups groups={s.groups} />
        </div>
      </Section>

      {slug === "algorithmic-trading" && "oversight" in s ? (
        <>
          <WidgetSection index={widgetIndex} heading={s.interactive.heading} hint={pagesUi.risk.sliderHint}>
            <RiskLimitSlider />
          </WidgetSection>
          <Section className="pb-24 lg:pb-36">
            <div className="container-x grid grid-cols-12 gap-x-6 gap-y-10">
              <Reveal className="col-span-12 lg:col-span-7">
                <blockquote className="relative pl-8 md:pl-12">
                  <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-accent via-accent/40 to-transparent" />
                  <p className="font-display text-[clamp(24px,2.6vw,36px)] leading-[1.2] tracking-[-0.025em]">{s.oversight}</p>
                </blockquote>
                <div className="mt-10 pl-8 md:pl-12">
                  <Button href={home.closing.cta.href}>{home.closing.cta.label}</Button>
                </div>
              </Reveal>
              <Reveal delay={0.08} className="col-span-12 lg:col-span-5">
                <DisclaimerBlock />
              </Reveal>
            </div>
          </Section>
        </>
      ) : null}

      {slug === "data-analytics" && "interactive" in s ? (
        <WidgetSection index={widgetIndex} heading={s.interactive.heading}>
          <AnalyticsDashboard />
        </WidgetSection>
      ) : null}

      {slug === "infrastructure" && "interactive" in s ? (
        <WidgetSection index={widgetIndex} heading={s.interactive.heading}>
          <MonitoringPanel />
        </WidgetSection>
      ) : null}

      {"standard" in s ? (
        <Section className="pb-24 lg:pb-36">
          <div className="container-x">
            <Reveal>
              <div className="panel relative overflow-hidden px-6 py-14 md:px-14 md:py-20">
                <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/15 blur-[100px]" />
                <p className="section-index relative mb-8">
                  <span className="text-accent">{pad(s.groups.length + 1)}</span>
                </p>
                <p className="relative max-w-[26ch] font-display text-[clamp(28px,3.6vw,52px)] leading-[1.08] tracking-[-0.035em]">
                  {s.standard}
                </p>
              </div>
            </Reveal>
          </div>
        </Section>
      ) : null}

      <Closing />
    </>
  );
}
