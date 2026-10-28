import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/v2/V2Link";
import { notFound } from "next/navigation";
import { nav, solutions, v2Pages, type SolutionSlug } from "@/content/copy";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DisclaimerBlock from "@/components/v2/ui/DisclaimerBlock";
import Eyebrow from "@/components/v2/ui/Eyebrow";
import SectionHeading from "@/components/v2/ui/SectionHeading";
import PageHero from "@/components/v2/PageHero";
import CtaBand from "@/components/v2/CtaBand";
import { ArrowRight, CheckBadge } from "@/components/v2/icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(solutions) as SolutionSlug[]).map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

const PHOTOS: Record<SolutionSlug, string> = {
  "algorithmic-trading": "/images/trading-chart.jpg",
  "data-analytics": "/images/analytics-dashboard.jpg",
  infrastructure: "/images/data-centre.jpg",
  software: "/images/team-laptops.jpg",
};

function isSlug(slug: string): slug is SolutionSlug {
  return slug in solutions;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const s = solutions[slug];
  return { title: s.title, description: s.sub, alternates: { canonical: `/solutions/${slug}` } };
}

type Group = { heading: string; items: readonly string[] };

function GroupCard({ group, index, wide }: { group: Group; index: number; wide: boolean }) {
  return (
    <div className={`card p-7 md:p-9 ${wide ? "grid gap-8 lg:grid-cols-12" : "flex flex-col"}`}>
      <div className={wide ? "lg:col-span-4" : ""}>
        {wide ? null : (
          <p className="num mb-3 text-[13px] font-semibold text-muted">{String(index + 1).padStart(2, "0")}</p>
        )}
        <h3 className="h3">{group.heading}</h3>
      </div>
      <ul className={wide ? "grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:col-span-8" : "mt-7 flex flex-col gap-4"}>
        {group.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[16px] leading-snug text-body">
            <CheckBadge className="-mt-px" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Statement({ eyebrow, text }: { eyebrow: string; text: string }) {
  return (
    <div className="border-l-2 border-accent pl-6 md:pl-10">
      <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
      <p className="font-display text-[clamp(24px,2.7vw,36px)] font-semibold leading-[1.25] tracking-[-0.02em] text-text">
        {text}
      </p>
    </div>
  );
}

export default async function SolutionPage({ params }: Params) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const s = solutions[slug];
  const href = `/solutions/${slug}`;
  const groups: readonly Group[] = s.groups;
  const oversight = "oversight" in s ? s.oversight : null;
  const standard = "standard" in s ? s.standard : null;
  const others = (Object.keys(solutions) as SolutionSlug[]).filter((k) => k !== slug);
  const relatedBg = oversight || standard ? "bg-surface" : "bg-bg";

  return (
    <>
      <Breadcrumbs
        items={[
          { name: v2Pages.solutionsLabel, path: nav.solutions[0].href },
          { name: s.title, path: href },
        ]}
      />
      <PageHero
        crumbs={[
          { label: v2Pages.solutionsLabel, href: nav.solutions[0].href },
          { label: s.title, href },
        ]}
        eyebrow={s.title}
        title={s.h1}
        sub={s.sub}
        primary={{ label: nav.contact.label, href: nav.contact.href }}
        image={{ src: PHOTOS[slug], alt: v2Pages.alt[slug] }}
      />

      <section aria-labelledby="deliver-h" className="section-y bg-surface">
        <div className="container-x">
          <SectionHeading eyebrow={s.title} title={v2Pages.solution.overviewTitle} id="deliver-h" />
          <div className={`mt-12 grid gap-6 lg:mt-16 ${groups.length > 1 ? "lg:grid-cols-3" : ""}`}>
            {groups.map((g, i) => (
              <GroupCard key={g.heading} group={g} index={i} wide={groups.length === 1} />
            ))}
          </div>
        </div>
      </section>

      {oversight ? (
        <section className="section-y bg-bg">
          <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <Statement eyebrow={v2Pages.solution.oversightEyebrow} text={oversight} />
            </div>
            <div className="lg:col-span-5 lg:pt-10">
              <DisclaimerBlock />
            </div>
          </div>
        </section>
      ) : null}

      {standard ? (
        <section className="section-y bg-bg">
          <div className="container-x">
            <div className="max-w-[900px]">
              <Statement eyebrow={v2Pages.solution.standardEyebrow} text={standard} />
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="related-h" className={`section-y ${relatedBg}`}>
        <div className="container-x">
          <SectionHeading eyebrow={v2Pages.related.eyebrow} title={v2Pages.related.heading} id="related-h" />
          <ul className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-14">
            {others.map((k) => {
              const o = solutions[k];
              return (
                <li key={k}>
                  <Link href={`/solutions/${k}`} className="card card-hover group flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                      <Image
                        src={PHOTOS[k]}
                        alt={v2Pages.alt[k]}
                        fill
                        sizes="(min-width: 1240px) 380px, (min-width: 768px) 31vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-[var(--ease-ui)] group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="h3">{o.title}</h3>
                      <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted">{o.sub}</p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[15px] font-semibold text-accent">
                        {v2Pages.related.link}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
