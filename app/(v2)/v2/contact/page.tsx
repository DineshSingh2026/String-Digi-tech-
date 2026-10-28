import type { Metadata } from "next";
import Image from "next/image";
import { company, contact, v2Pages } from "@/content/copy";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContactForm from "@/components/v2/ContactForm";
import PageHero from "@/components/v2/PageHero";
import { IdIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/v2/icons";

const PATH = "/contact";

export const metadata: Metadata = {
  title: contact.title,
  description: contact.sub,
  alternates: { canonical: PATH },
};

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[13px] font-medium text-muted">{label}</dt>
        <dd className="mt-1 text-[15px] leading-snug text-text">{children}</dd>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
  const s = contact.side;
  return (
    <>
      <Breadcrumbs items={[{ name: contact.title, path: PATH }]} />
      <PageHero
        crumbs={[{ label: contact.title, href: PATH }]}
        eyebrow={v2Pages.contact.eyebrow}
        title={contact.h1}
        sub={contact.sub}
        className="pb-12! lg:pb-16!"
      />

      <section aria-label={v2Pages.contact.formTitle} className="bg-surface pb-20 pt-12 lg:pb-28 lg:pt-16">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-8 md:p-10">
              <div className="mb-8 flex items-baseline justify-between gap-4">
                <h2 className="h3">{v2Pages.contact.formTitle}</h2>
                <p className="text-[13px] text-muted">
                  <span className="text-accent">*</span> {v2Pages.contact.required}
                </p>
              </div>
              <ContactForm />
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-5">
            <div className="photo aspect-[4/3]">
              <Image
                src="/images/marina-bay-night.jpg"
                alt={v2Pages.alt.contact}
                fill
                sizes="(min-width: 1240px) 480px, (min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="h3 mb-6">{v2Pages.contact.detailsTitle}</h2>
              <dl>
                <Row icon={<PinIcon />} label={s.addressLabel}>
                  <span className="block font-medium">{company.legalName}</span>
                  <span className="mt-1 block text-body">{company.address}</span>
                </Row>
                <Row icon={<IdIcon />} label={s.uenLabel}>
                  <span className="num">{company.uen}</span>
                </Row>
                {email ? (
                  <Row icon={<MailIcon />} label={s.emailLabel}>
                    <a href={`mailto:${email}`} className="break-all text-accent underline-offset-4 hover:underline">
                      {email}
                    </a>
                  </Row>
                ) : null}
                {phone ? (
                  <Row icon={<PhoneIcon />} label={s.phoneLabel}>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="num text-accent underline-offset-4 hover:underline">
                      {phone}
                    </a>
                  </Row>
                ) : null}
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
