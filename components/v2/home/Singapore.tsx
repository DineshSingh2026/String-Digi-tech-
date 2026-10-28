import { company, footer, home, v2Ui } from "@/content/copy";
import Eyebrow from "@/components/v2/ui/Eyebrow";
import Photo from "./Photo";

export default function Singapore() {
  return (
    <section aria-labelledby="sg-title" className="section-y bg-surface">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-4">{v2Ui.eyebrows.singapore}</Eyebrow>
            <h2 id="sg-title" className="h2 max-w-[20ch]">
              {home.singapore.heading}
            </h2>
          </div>
          <address className="not-italic lg:col-span-5 lg:justify-self-end">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">{v2Ui.registeredOffice}</p>
            <p className="mt-3 text-[16px] font-semibold text-text">{company.legalName}</p>
            <p className="mt-1 max-w-[36ch] text-[16px] leading-relaxed text-body">{company.address}</p>
            <p className="mt-1 text-[15px] text-muted">
              {footer.uenLabel} <span className="num">{company.uen}</span>
            </p>
          </address>
        </div>
        <Photo
          src="/images/marina-bay-day.jpg"
          alt={v2Ui.alt.singapore}
          sizes="(min-width: 1240px) 1176px, 100vw"
          className="mt-12 aspect-[4/3] sm:aspect-[21/9]"
        />
      </div>
    </section>
  );
}
