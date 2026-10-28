import type { Metadata } from "next";
import { about, company, footer, pagesUi } from "@/content/copy";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/sections/Section";
import Closing from "@/components/sections/Closing";
import Reveal from "@/components/ui/Reveal";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Panel from "@/components/pages/Panel";
import OfficeMap from "@/components/pages/OfficeMap";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: about.title,
  description: about.position,
  alternates: { canonical: "/about" },
};

function RecordPanel() {
  const rows = [
    { k: pagesUi.about.legalName, v: company.legalName, mono: false },
    { k: footer.uenLabel, v: company.uen, mono: true },
    { k: pagesUi.about.office, v: company.address, mono: false },
  ];
  return (
    <Panel
      title={pagesUi.about.record}
      right={
        <>
          <span className="live-dot" aria-hidden="true" />
          <span>{pagesUi.about.country}</span>
        </>
      }
      bodyClassName=""
    >
      <div className="relative overflow-hidden border-b border-white/[0.06] px-6 py-8">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span aria-hidden="true" className="shrink-0">
            <Logo variant="mark" height={52} />
          </span>
          <p className="font-display text-[clamp(26px,2.8vw,38px)] leading-none tracking-[-0.04em]">{company.wordmark}</p>
        </div>
        <p className="mono relative mt-3 text-[11px] uppercase tracking-[0.14em] text-muted">{pagesUi.about.grid}</p>
      </div>
      <dl className="divide-y divide-white/[0.06]">
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-[110px_1fr] gap-4 px-6 py-4">
            <dt className="mono pt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-muted">{r.k}</dt>
            <dd className={`text-[15px] leading-snug text-text ${r.mono ? "mono tracking-[0.06em]" : ""}`}>{r.v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function Mission() {
  const focus = "intelligent, reliable and risk-aware";
  const at = about.mission.indexOf(focus);
  const parts =
    at >= 0
      ? [about.mission.slice(0, at), about.mission.slice(at, at + focus.length), about.mission.slice(at + focus.length)]
      : [about.mission, "", ""];
  return (
    <figure className="relative">
      <span
        aria-hidden="true"
        className="text-gradient-accent pointer-events-none absolute -left-1 -top-[92px] select-none font-display text-[160px] leading-none opacity-90 md:-left-3 md:-top-[150px] md:text-[240px]"
      >
        “
      </span>
      <blockquote className="relative">
        <p className="max-w-[24ch] font-display text-[clamp(32px,4.6vw,68px)] leading-[1.06] tracking-[-0.04em] text-text">
          {parts[0]}
          {parts[1] ? <span className="text-gradient-accent">{parts[1]}</span> : null}
          {parts[2]}
        </p>
      </blockquote>
      <figcaption className="mono mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
        <span aria-hidden="true" className="h-px w-10 bg-accent" />
        {company.legalName}
      </figcaption>
    </figure>
  );
}

function Leadership() {
  if (about.leadership.length === 0) return null;
  return (
    <Section className="py-20 lg:py-28" labelledBy="leadership-h">
      <div className="container-x">
        <h2 id="leadership-h" className="h2">
          {about.leadershipHeading}
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {about.leadership.map((p) => (
            <li key={p.name} className="panel p-6">
              <p className="font-display text-[22px]">{p.name}</p>
              <p className="eyebrow mt-2">{p.role}</p>
              {p.bio ? <p className="mt-4 text-muted">{p.bio}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: about.title, path: "/about" }]} />
      <PageHero
        scene="SignalFieldCalm"
        title={about.h1}
        sub={about.position}
        crumbs={[{ label: about.title, href: "/about" }]}
        aside={<RecordPanel />}
      />

      <Section className="py-20 lg:py-28" labelledBy="who-h">
        <div className="container-x grid grid-cols-12 gap-x-6 gap-y-10">
          <Reveal className="col-span-12 lg:col-span-4">
            <p className="section-index mb-6">
              <span className="text-accent">01</span>
            </p>
            <h2 id="who-h" className="h2">
              {about.whoHeading}
            </h2>
          </Reveal>
          <Reveal delay={0.06} className="col-span-12 lg:col-span-7 lg:col-start-6">
            <p className="font-display text-[clamp(22px,2.2vw,30px)] leading-[1.3] tracking-[-0.02em] text-text">{about.who}</p>
          </Reveal>
        </div>
      </Section>

      <Section className="overflow-hidden py-20 lg:py-28" labelledBy="mission-h">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[120px]" />
        <div className="container-x">
          <Reveal>
            <p className="section-index mb-28 md:mb-40">
              <span className="text-accent">02</span>
              <span aria-hidden="true">—</span>
              <span id="mission-h">{about.missionHeading}</span>
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <Mission />
          </Reveal>
        </div>
      </Section>

      <Section className="py-20 lg:py-28" labelledBy="office-h">
        <div className="container-x grid grid-cols-12 items-center gap-x-6 gap-y-10">
          <Reveal className="col-span-12 lg:col-span-4">
            <p className="section-index mb-6">
              <span className="text-accent">03</span>
            </p>
            <h2 id="office-h" className="h2">
              {about.officeHeading}
            </h2>
            <address className="mt-8 not-italic">
              <span className="block text-[17px] text-text">{company.legalName}</span>
              <span className="mt-2 block text-[17px] leading-relaxed text-muted">{company.addressParts.streetAddress}</span>
              <span className="block text-[17px] text-muted">
                {company.addressParts.addressLocality} {company.addressParts.postalCode}
              </span>
            </address>
          </Reveal>
          <Reveal delay={0.08} className="col-span-12 lg:col-span-8">
            <OfficeMap />
          </Reveal>
        </div>
      </Section>
      <Leadership />
      <Closing />
    </>
  );
}
