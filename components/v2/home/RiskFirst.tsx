import { home, v2Ui } from "@/content/copy";
import Eyebrow from "@/components/v2/ui/Eyebrow";
import Photo from "./Photo";
import { CheckBadge } from "./icons";

export default function RiskFirst() {
  const r = home.riskFirst;
  return (
    <section aria-labelledby="risk-title" className="section-y bg-bg">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Photo
          src="/images/towers.jpg"
          alt={v2Ui.alt.riskFirst}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="aspect-[4/3] lg:col-span-6 lg:aspect-[4/5]"
        />
        <div className="lg:col-span-6">
          <Eyebrow className="mb-4">{v2Ui.eyebrows.riskFirst}</Eyebrow>
          <h2 id="risk-title" className="h2">
            {r.heading}
          </h2>
          <p className="lead prose-body mt-5">{r.body}</p>
          <ol className="mt-8 border-t border-line">
            {r.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-4 border-b border-line py-4">
                <span className="num w-6 text-[13px] font-semibold text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-[16px] font-medium text-text">{s}</span>
                <CheckBadge />
              </li>
            ))}
          </ol>
          <p className="mt-8 border-l-2 border-accent pl-5 font-display text-[20px] font-semibold leading-snug tracking-[-0.01em] text-text">
            {r.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
