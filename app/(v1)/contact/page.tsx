import type { Metadata } from "next";
import { company, contact, pagesUi } from "@/content/copy";
import Section from "@/components/sections/Section";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/interactive/ContactForm";
import Panel from "@/components/pages/Panel";
import Trail from "@/components/pages/Trail";

export const metadata: Metadata = {
  title: contact.title,
  description: contact.sub,
  alternates: { canonical: "/contact" },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 px-5 py-4">
      <dt className="mono pt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="min-w-0 text-[15px] leading-snug text-text">{children}</dd>
    </div>
  );
}

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
  const s = contact.side;
  return (
    <>
      <Breadcrumbs items={[{ name: contact.title, path: "/contact" }]} />
      <Section scene="SignalFieldCalm" labelledBy="contact-h" className="overflow-hidden pb-24 pt-32 md:pb-32 lg:pt-36">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[-10%] top-[20%] -z-10 h-[560px] w-[560px] rounded-full bg-accent/[0.08] blur-[130px]" />
        <div className="container-x grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="contents lg:col-span-5 lg:flex lg:flex-col">
            <Reveal className="col-span-12">
              <Trail crumbs={[{ label: contact.title, href: "/contact" }]} className="mb-10" />
              <h1
                id="contact-h"
                className="text-gradient pb-2 font-display text-[clamp(44px,6vw,92px)] leading-[1.0] tracking-[-0.045em]"
              >
                {contact.h1}
              </h1>
              <p className="mt-7 max-w-[44ch] border-l border-accent/60 pl-5 text-[17px] leading-relaxed text-muted md:text-[19px]">
                {contact.sub}
              </p>
            </Reveal>
            <Reveal delay={0.1} className="order-last col-span-12 lg:order-none lg:mt-12">
              <Panel
                as="aside"
                title={pagesUi.contact.direct}
                right={
                  <>
                    <span className="live-dot" aria-hidden="true" />
                    <span>{pagesUi.about.country}</span>
                  </>
                }
                bodyClassName=""
              >
                <dl className="divide-y divide-white/[0.06]">
                  <Row label={s.addressLabel}>
                    <span className="block">{company.legalName}</span>
                    <span className="mt-1 block text-muted">{company.address}</span>
                  </Row>
                  <Row label={s.uenLabel}>
                    <span className="mono tracking-[0.06em]">{company.uen}</span>
                  </Row>
                  {email ? (
                    <Row label={s.emailLabel}>
                      <a
                        href={`mailto:${email}`}
                        className="break-all underline decoration-white/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                      >
                        {email}
                      </a>
                    </Row>
                  ) : null}
                  {phone ? (
                    <Row label={s.phoneLabel}>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="mono transition-colors hover:text-accent">
                        {phone}
                      </a>
                    </Row>
                  ) : null}
                </dl>
              </Panel>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <Reveal delay={0.06}>
              <Panel
                title={
                  <>
                    {pagesUi.contact.formTitle} <span className="text-accent">{"//"}</span> {contact.title}
                  </>
                }
                right={
                  <span className="normal-case tracking-normal">
                    <span className="text-accent">*</span> {pagesUi.contact.required}
                  </span>
                }
                className="!bg-[#0b0f15]/[0.96]"
                bodyClassName="relative p-5 md:p-8"
              >
                <ContactForm />
              </Panel>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
