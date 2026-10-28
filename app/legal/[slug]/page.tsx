import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { company, footer, legal, v2Pages, type LegalSlug } from "@/content/copy";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Crumbs } from "@/components/v2/PageHero";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(legal) as LegalSlug[]).map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

function isSlug(slug: string): slug is LegalSlug {
  return slug in legal;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const title = legal[slug].title;
  return { title, description: `${title}, ${company.legalName}`, alternates: { canonical: `/legal/${slug}` } };
}

const prose =
  "text-[16px] leading-[1.75] text-body md:text-[17px] " +
  "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_h1]:mb-10 [&_h1]:font-display [&_h1]:text-[clamp(36px,4.4vw,56px)] [&_h1]:font-semibold [&_h1]:leading-[1.05] [&_h1]:tracking-[-0.03em] [&_h1]:text-text " +
  "[&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:border-t [&_h2]:border-line [&_h2]:pt-10 [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-text " +
  "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:text-text " +
  "[&_p]:mb-5 [&_strong]:text-text [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_li]:pl-1 [&_li::marker]:text-accent";

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const { default: Content } = await import(`@/content/legal/${slug}.mdx`);
  const docs = Object.keys(legal) as LegalSlug[];
  const path = `/legal/${slug}`;
  return (
    <>
      <Breadcrumbs items={[{ name: legal[slug].title, path }]} />
      <section className="bg-bg pb-24 pt-28 md:pt-32 lg:pb-32 lg:pt-36">
        <div className="container-x">
          <Crumbs items={[{ label: legal[slug].title, href: path }]} className="mb-10 lg:mb-14" />
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow mb-4">{v2Pages.legal.navTitle}</p>
                <nav aria-label={v2Pages.legal.navTitle}>
                  <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                    {docs.map((d) => {
                      const on = d === slug;
                      return (
                        <li key={d}>
                          <Link
                            href={`/legal/${d}`}
                            aria-current={on ? "page" : undefined}
                            className={`block rounded-lg px-4 py-2.5 text-[15px] transition-colors lg:border-l-2 lg:rounded-l-none ${
                              on
                                ? "bg-surface font-semibold text-text lg:border-accent"
                                : "border border-line text-body hover:bg-surface hover:text-text lg:border-y-0 lg:border-r-0 lg:border-line"
                            }`}
                          >
                            {legal[d].title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <p className="mt-8 hidden text-[13px] leading-relaxed text-muted lg:block">
                  {company.legalName}
                  <br />
                  {footer.uenLabel} <span className="num">{company.uen}</span>
                </p>
              </div>
            </aside>
            <article className={`max-w-[72ch] lg:col-span-8 lg:col-start-5 ${prose}`}>
              <Content />
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
