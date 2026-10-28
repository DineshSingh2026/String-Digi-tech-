import type { Metadata } from "next";
import Image from "next/image";
import { about, company, v2Pages } from "@/content/copy";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Eyebrow from "@/components/v2/ui/Eyebrow";
import SectionHeading from "@/components/v2/ui/SectionHeading";
import PageHero from "@/components/v2/PageHero";
import CtaBand from "@/components/v2/CtaBand";

const PATH = "/about";

export const metadata: Metadata = {
  title: about.title,
  description: about.who,
  alternates: { canonical: PATH },
};

export default function AboutPage() {
  const a = v2Pages.about;
  return (
    <>
      <Breadcrumbs items={[{ name: about.title, path: PATH }]} />
      <PageHero
        crumbs={[{ label: about.title, href: PATH }]}
        eyebrow={a.eyebrow}
        title={about.h1}
        sub={about.position}
        layout="wide"
        image={{ src: "/images/office-open-plan.jpg", alt: v2Pages.alt.about }}
      />

      {/* Who we are */}
      <section aria-labelledby="who-h" className="section-y bg-surface">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow className="mb-4">{about.title}</Eyebrow>
            <h2 id="who-h" className="h2">
              {about.whoHeading}
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="lead">{about.who}</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section aria-labelledby="mission-h" className="section-y bg-bg">
        <div className="container-x">
          <figure className="mx-auto max-w-[980px] text-center">
            <Eyebrow className="mb-8">
              <span id="mission-h">{about.missionHeading}</span>
            </Eyebrow>
            <svg viewBox="0 0 48 36" aria-hidden="true" className="mx-auto h-9 w-12 text-brand">
              <path
                fill="currentColor"
                d="M0 36V22.5C0 9.9 6.3 2.4 18.9 0l2.2 5.1C14.4 7.2 11 11.1 10.6 16.8H20V36H0zm27 0V22.5C27 9.9 33.3 2.4 45.9 0l2.1 5.1C41.4 7.2 38 11.1 37.6 16.8H47V36H27z"
              />
            </svg>
            <blockquote className="mt-8">
              <p className="font-display text-[clamp(26px,3.4vw,44px)] font-semibold leading-[1.2] tracking-[-0.025em] text-text">
                {about.mission}
              </p>
            </blockquote>
            <figcaption className="mt-8 text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
              {company.wordmark}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Registered office */}
      <section aria-labelledby="office-h" className="section-y bg-surface">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="photo aspect-[4/3]">
              <Image
                src="/images/marina-bay-day.jpg"
                alt={v2Pages.alt.office}
                fill
                sizes="(min-width: 1240px) 590px, (min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-6">
            <SectionHeading eyebrow={a.officeEyebrow} title={about.officeHeading} id="office-h" />
            <dl className="mt-10 border-b border-line">
              {[
                { label: a.legalName, value: company.legalName },
                { label: a.uen, value: company.uen },
                { label: a.address, value: company.address },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 border-t border-line py-5 sm:grid-cols-[140px_1fr] sm:gap-6">
                  <dt className="text-[14px] font-medium text-muted">{row.label}</dt>
                  <dd className="text-[16px] text-text">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {about.leadership.length > 0 ? (
        <section aria-labelledby="leadership-h" className="section-y bg-bg">
          <div className="container-x">
            <SectionHeading title={about.leadershipHeading} id="leadership-h" />
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {about.leadership.map((p) => (
                <li key={p.name} className="card p-8">
                  <h3 className="h3">{p.name}</h3>
                  <p className="mt-1 text-[15px] text-accent">{p.role}</p>
                  {p.bio ? <p className="mt-4 text-[15px] leading-relaxed text-body">{p.bio}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
