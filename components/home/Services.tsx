import { home, v2Ui } from "@/content/copy";
import SectionHeading from "@/components/ui/SectionHeading";
import Photo from "./Photo";
import TextLink from "./TextLink";

const PHOTOS = [
  "/images/trading-chart.jpg",
  "/images/analytics-dashboard.jpg",
  "/images/data-centre.jpg",
  "/images/team-laptops.jpg",
] as const;

export default function Services() {
  return (
    <section aria-labelledby="services-title" className="section-y bg-surface">
      <div className="container-x">
        <SectionHeading id="services-title" eyebrow={v2Ui.eyebrows.services} title={home.services.heading} />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {home.services.tiles.map((t, i) => (
            <li key={t.href} className="card card-hover group relative flex flex-col overflow-hidden">
              <Photo
                src={PHOTOS[i]}
                alt={v2Ui.alt.services[i]}
                sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                framed={false}
                className="aspect-[16/9] bg-surface-2 sm:aspect-[3/2]"
                imgClassName="transition-transform duration-500 ease-[var(--ease-ui)] group-hover:scale-[1.03]"
              />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="h3">{t.title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">{t.body}</p>
                <TextLink href={t.href} srLabel={t.title} stretch className="mt-6 self-start">
                  {v2Ui.learnMore}
                </TextLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
