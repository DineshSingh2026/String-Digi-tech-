import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { company, footer, legal, pagesUi, type LegalSlug } from "@/content/copy";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trail from "@/components/pages/Trail";
import Panel from "@/components/pages/Panel";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(legal) as LegalSlug[]).map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in legal)) return {};
  const title = legal[slug as LegalSlug].title;
  return { title, description: title, alternates: { canonical: `/legal/${slug}` } };
}

const prose =
  "text-[16px] leading-[1.75] text-muted md:text-[17px] " +
  "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_h1]:mb-10 [&_h1]:font-display [&_h1]:text-[clamp(36px,5vw,64px)] [&_h1]:leading-[1.03] [&_h1]:tracking-[-0.04em] [&_h1]:text-text " +
  "[&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3 [&_h2]:border-t [&_h2]:border-white/[0.08] [&_h2]:pt-8 [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:tracking-[-0.02em] [&_h2]:text-text " +
  "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-[19px] [&_h3]:text-text " +
  "[&_li]:mb-2 [&_li]:pl-1 [&_p]:mb-5 [&_strong]:text-text [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li::marker]:text-accent";

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  if (!(slug in legal)) notFound();
  const current = slug as LegalSlug;
  const { default: Content } = await import(`@/content/legal/${slug}.mdx`);
  const docs = Object.keys(legal) as LegalSlug[];
  return (
    <>
      <Breadcrumbs items={[{ name: legal[current].title, path: `/legal/${slug}` }]} />
      <section className="relative isolate overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-36">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-bg/90" />
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />
        <div className="container-x">
          <Trail
            crumbs={[
              { label: pagesUi.legal.index, href: `/legal/${docs[0]}` },
              { label: legal[current].title, href: `/legal/${slug}` },
            ]}
            className="mb-12"
          />
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <aside className="col-span-12 lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <Panel title={pagesUi.legal.index} bodyClassName="p-2">
                  <nav aria-label={pagesUi.legal.index}>
                    <ul>
                      {docs.map((d, i) => {
                        const on = d === current;
                        return (
                          <li key={d}>
                            <Link
                              href={`/legal/${d}`}
                              aria-current={on ? "page" : undefined}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                                on ? "bg-accent/10 text-text" : "text-muted hover:bg-white/[0.04] hover:text-text"
                              }`}
                            >
                              <span className={`mono text-[10.5px] ${on ? "text-accent" : "text-muted"}`}>
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              {legal[d].title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </Panel>
                <p className="mono mt-5 px-1 text-[10.5px] uppercase leading-relaxed tracking-[0.12em] text-muted">
                  {company.legalName}
                  <br />
                  {footer.uenLabel} {company.uen}
                </p>
              </div>
            </aside>
            <article className={`col-span-12 max-w-[72ch] lg:col-span-8 lg:col-start-5 ${prose}`}>
              <Content />
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
