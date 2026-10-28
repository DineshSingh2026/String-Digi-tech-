import Button from "@/components/v2/ui/Button";
import { home, v2Pages } from "@/content/copy";

/** Closing call to action on a dark navy band. */
export default function CtaBand() {
  const c = home.closing;
  return (
    <section aria-labelledby="cta-h" className="border-b border-white/10 bg-ink">
      <div className="container-x py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5 text-brand!">{v2Pages.cta.eyebrow}</p>
            <h2 id="cta-h" className="h2 text-white!">
              {c.heading}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[17px] leading-relaxed text-white/70">{c.body}</p>
            <Button href={c.cta.href} className="mt-8">
              {c.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
