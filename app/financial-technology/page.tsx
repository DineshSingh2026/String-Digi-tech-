import type { Metadata } from "next";
import { fintech, nav, v2Pages } from "@/content/copy";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionHeading from "@/components/ui/SectionHeading";
import PageHero from "@/components/v2/PageHero";
import CtaBand from "@/components/v2/CtaBand";
import { ChartIcon, FlowIcon, ServerIcon, ShieldIcon } from "@/components/v2/icons";

const PATH = "/financial-technology";

export const metadata: Metadata = {
  title: fintech.title,
  description: fintech.sub,
  alternates: { canonical: PATH },
};

// One icon per entry of fintech.supports, same order.
const ICONS = [ServerIcon, ChartIcon, FlowIcon, ShieldIcon];

export default function FinancialTechnologyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: fintech.title, path: PATH }]} />
      <PageHero
        crumbs={[{ label: fintech.title, href: PATH }]}
        eyebrow={v2Pages.fintech.eyebrow}
        title={fintech.h1}
        sub={fintech.sub}
        primary={{ label: nav.contact.label, href: nav.contact.href }}
        layout="wide"
        image={{ src: "/images/towers.jpg", alt: v2Pages.alt.fintech }}
      />

      <section aria-labelledby="supports-h" className="section-y bg-surface">
        <div className="container-x">
          <SectionHeading eyebrow={fintech.supportsHeading} title={v2Pages.fintech.supportsTitle} id="supports-h" />
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-16">
            {fintech.supports.map((item, i) => {
              const Icon = ICONS[i] ?? ServerIcon;
              return (
                <li key={item} className="card card-hover flex flex-col p-8 md:p-10">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="num text-[13px] font-semibold text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="h3 mt-10 max-w-[24ch]">{item}</h3>
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
