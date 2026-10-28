import { home, v2Ui } from "@/content/copy";
import Eyebrow from "@/components/ui/Eyebrow";
import Photo from "./Photo";
import TextLink from "./TextLink";
import { CheckIcon } from "./icons";

function MiniList({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div className="h-full rounded-xl border border-line bg-white p-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5 text-[15px] leading-snug text-text">
            <CheckIcon className="mt-[2px] h-4 w-4 shrink-0 text-accent" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Row = {
  id: string;
  eyebrow: string;
  heading: string;
  photo: string;
  alt: string;
  href: string;
  linkLabel: string;
  body: React.ReactNode;
};

export default function FeatureRows() {
  const a = home.analytics;
  const rows: Row[] = [
    {
      id: "analytics",
      eyebrow: v2Ui.eyebrows.analytics,
      heading: a.heading,
      photo: "/images/analytics-dashboard.jpg",
      alt: v2Ui.alt.analytics,
      href: "/solutions/data-analytics",
      linkLabel: home.services.tiles[1].title,
      body: (
        <div className="mt-8 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <MiniList label={a.inputsLabel} items={a.inputs} />
          <span aria-hidden="true" className="flex items-center justify-center text-[20px] text-muted">
            <span className="rotate-90 sm:rotate-0">→</span>
          </span>
          <MiniList label={a.outputsLabel} items={a.outputs} />
        </div>
      ),
    },
    {
      id: "infrastructure",
      eyebrow: v2Ui.eyebrows.infrastructure,
      heading: home.infrastructure.heading,
      photo: "/images/data-centre.jpg",
      alt: v2Ui.alt.infrastructure,
      href: "/solutions/infrastructure",
      linkLabel: home.services.tiles[2].title,
      body: <p className="lead prose-body mt-5">{home.infrastructure.body}</p>,
    },
    {
      id: "software",
      eyebrow: v2Ui.eyebrows.software,
      heading: home.software.heading,
      photo: "/images/office-open-plan.jpg",
      alt: v2Ui.alt.software,
      href: "/solutions/software",
      linkLabel: home.services.tiles[3].title,
      body: <p className="lead prose-body mt-5">{home.software.body}</p>,
    },
  ];

  return (
    <section className="section-y bg-bg">
      <div className="container-x flex flex-col gap-24 lg:gap-32">
        {rows.map((r, i) => {
          const flip = i % 2 === 1;
          return (
            <article key={r.id} aria-labelledby={`${r.id}-title`} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <Photo
                src={r.photo}
                alt={r.alt}
                sizes="(min-width: 1024px) 600px, 100vw"
                className={`aspect-[4/3] lg:col-span-6 ${flip ? "lg:order-2" : ""}`}
              />
              <div className={`lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
                <Eyebrow className="mb-4">{r.eyebrow}</Eyebrow>
                <h2 id={`${r.id}-title`} className="h2">
                  {r.heading}
                </h2>
                {r.body}
                <TextLink href={r.href} srLabel={r.linkLabel} className="mt-8">
                  {v2Ui.learnMore}
                </TextLink>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
